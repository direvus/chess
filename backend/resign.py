#!/usr/bin/env python3
# coding: utf-8

import json
import os

import boto3


DYNAMO = boto3.resource('dynamodb')
TABLE = DYNAMO.Table(os.environ['TABLE_NAME'])


def resign(connid, gameid):
    item = TABLE.get_item(Key={'id': gameid})['Item']
    if connid not in (item['host'], item['guest']):
        return None

    game = item['game']
    if item['host_plays_white']:
        result = 0
    else:
        result = 1

    if connid == item['guest']:
        result = int(not result)

    game['result'] = result
    if result:
        game['tags']['Result'] = '1-0'
    else:
        game['tags']['Result'] = '0-1'

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
        Data=json.dumps(data).encode('utf-8'))


def lambda_handler(event, context):
    print(event)
    ctx = event['requestContext']
    body = json.loads(event['body'])

    item = resign(ctx['connectionId'], body['id'])
    if item:
        game = item['game']
        post = {
            'action': 'resign',
            'id': item['id'],
            'result': int(game['result']),
            'tag': game['tags']['Result'],
        }
        send(ctx, item['host'], post)
        send(ctx, item['guest'], post)
    response = {'statusCode': 200, 'body': 'OK.'}
    print(response)
    return response
