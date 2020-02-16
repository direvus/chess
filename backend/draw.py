#!/usr/bin/env python3
# coding: utf-8

import json
import os

import boto3


DYNAMO = boto3.resource('dynamodb')
TABLE = DYNAMO.Table(os.environ['TABLE_NAME'])


def draw_game(connid, gameid, value):
    item = TABLE.get_item(Key={'id': gameid})['Item']
    if connid not in (item['host'], item['guest']):
        return None

    if connid == item['host']:
        attr = 'draw_host'
    else:
        attr = 'draw_guest'

    res = TABLE.update_item(
        Key={'id': gameid},
        UpdateExpression="SET #draw = :value",
        ExpressionAttributeValues={'#draw': attr, ':value': value},
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

    value = True
    if body['mode'] == 'decline':
        value = False

    item = draw_game(ctx['connectionId'], body['id'], value)
    if item:
        if item['draw_host'] and item['draw_guest']:
            # Draw has been agreed, notify both players
            post = {
                'action': 'draw',
                'id': item['id'],
            }
            send(ctx, item['host'], post)
            send(ctx, item['guest'], post)
        elif body['mode'] == 'offer':
            # A player has offered a draw, notify the other player
            post = {
                'action': 'offerdraw',
                'id': item['id'],
            }
            other = item['guest']
            if ctx['connectionId'] == item['guest']:
                other = item['host']
            send(ctx, other, post)
        elif body['mode'] == 'decline':
            # A player has declined a draw, notify the other player
            post = {
                'action': 'declinedraw',
                'id': item['id'],
            }
            other = item['guest']
            if ctx['connectionId'] == item['guest']:
                other = item['host']
            send(ctx, other, post)

    response = {'statusCode': 200, 'body': 'OK.'}
    print(response)
    return response
