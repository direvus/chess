#!/usr/bin/env python3
# coding: utf-8

import json
import os
from decimal import Decimal

import boto3


DYNAMO = boto3.resource('dynamodb')
TABLE = DYNAMO.Table(os.environ['TABLE_NAME'])


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj.normalize().as_tuple()[2] >= 0:
                return int(obj)
            return str(obj)
        return json.JSONEncoder.default(self, obj)


def do_move(connid, gameid, move):
    item = TABLE.get_item(Key={'id': gameid})['Item']
    if connid not in (item['host'], item['guest']):
        return None

    game = item['game']
    game['board'] = move['board']
    game['moves'].append(move)
    game['turn'] += 1
    res = TABLE.update_item(
        Key={'id': gameid},
        UpdateExpression="SET game = :game",
        ExpressionAttributeValues={':game': game},
        ReturnValues='ALL_NEW')
    return res['Attributes']


def send(context, connid, data):
    url = 'https://{domainName}/{stage}'.format(**context)
    client = boto3.client('apigatewaymanagementapi', endpoint_url=url)
    client.post_to_connection(
        ConnectionId=connid,
        Data=json.dumps(data, cls=DecimalEncoder).encode('utf-8'))


def lambda_handler(event, context):
    print(event)
    ctx = event['requestContext']
    body = json.loads(event['body'])

    item = do_move(ctx['connectionId'], body['id'], body['move'])
    if item:
        game = item['game']
        post = {
            'action': 'move',
            'id': item['id'],
            'game': {
                'board': game['board'],
                'turn': int(game['turn']),
                'moves': game['moves'],
                'tags': game['tags'],
                'result': game['result']
            }
        }
        send(ctx, item['host'], post)
        send(ctx, item['guest'], post)
    response = {'statusCode': 200, 'body': 'OK.'}
    print(response)
    return response
