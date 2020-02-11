#!/usr/bin/env python3
# coding: utf-8

import json
import os
import random

import boto3


DYNAMO = boto3.resource('dynamodb')
TABLE = DYNAMO.Table(os.environ['TABLE_NAME'])
KEY_CHARS = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789=+'


def generate_id(size=4):
    return ''.join([random.choice(KEY_CHARS) for x in range(size)])


def create_game(connid, request):
    key = generate_id()
    game = request['game']
    data = {
        'id': key,
        'host_plays_white': bool(request['host_plays_white']),
        'host': connid,
        'guest': None,
        # Filter out elements with empty strings, because DynamoDB is a derp.
        'game': {
            'board': game['board'],
            'moves': game['moves'],
            'turn': int(game['turn']),
            'tags': {x: y for x, y in game['tags'].items() if y != ''},
            'result': game['result'] or None
        }
    }
    TABLE.put_item(
        Item=data,
        ConditionExpression=boto3.dynamodb.conditions.Attr('key').not_exists())
    return key


def send(context, data):
    url = 'https://{domainName}/{stage}'.format(**context)
    client = boto3.client('apigatewaymanagementapi', endpoint_url=url)
    client.post_to_connection(
        ConnectionId=context['connectionId'],
        Data=json.dumps(data).encode('utf-8'))


def lambda_handler(event, context):
    print(event)
    ctx = event['requestContext']
    body = json.loads(event['body'])

    key = create_game(ctx['connectionId'], body)
    post = {
        'action': 'newgame',
        'id': key
    }

    send(ctx, post)
    response = {'statusCode': 200, 'body': 'OK.'}
    print(response)
    return response
