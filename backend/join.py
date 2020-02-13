#!/usr/bin/env python3
# coding: utf-8

import json
import os

import boto3


DYNAMO = boto3.resource('dynamodb')
TABLE = DYNAMO.Table(os.environ['TABLE_NAME'])


def join_game(connid, gameid):
    item = TABLE.get_item(Key={'id': gameid})['Item']
    if item['guest'] and item['guest'] != connid:
        return None

    res = TABLE.update_item(
        Key={'id': gameid},
        UpdateExpression="set guest = :guest",
        ExpressionAttributeValues={':guest': connid},
        ReturnValues='ALL_NEW')
    return res['Attributes']


def send(context, connid, data):
    url = 'https://{domainName}/{stage}'.format(**context)
    client = boto3.client('apigatewaymanagementapi', endpoint_url=url)
    client.post_to_connection(
        ConnectionId=connid,
        Data=json.dumps(data).encode('utf-8'))


def lambda_handler(event, context):
    print(event)
    ctx = event['requestContext']
    body = json.loads(event['body'])

    item = join_game(ctx['connectionId'], body['id'])
    if item:
        game = item['game']
        post = {
            'action': 'hostgame',
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

        post['action'] = 'joingame'
        send(ctx, item['guest'], post)
    response = {'statusCode': 200, 'body': 'OK.'}
    print(response)
    return response
