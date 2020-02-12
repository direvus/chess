#!/usr/bin/env python3
# coding: utf-8

import json
import os

import boto3


DYNAMO = boto3.resource('dynamodb')
TABLE = DYNAMO.Table(os.environ['TABLE_NAME'])


def cancel_game(connid, gameid):
    try:
        TABLE.delete_item(
                Key={'id': gameid},
                ConditionExpression='host = :connid',
                ExpressionAttributeValues={':connid': connid})
        return gameid
    except Exception as e:
        print("Failed to delete game {}.")
        return None


def send(context, connid, data):
    url = 'https://{domainName}/{stage}'.format(**context)
    client = boto3.client('apigatewaymanagementapi', endpoint_url=url)
    client.post_to_connection(
        ConnectionId=context['connectionId'],
        Data=json.dumps(data).encode('utf-8'))


def lambda_handler(event, context):
    print(event)
    ctx = event['requestContext']
    body = json.loads(event['body'])

    connid = ctx['connectionId']
    gameid = body['id']
    try:
        item = TABLE.get_item(Key={'id': gameid})['Item']
        if item['host'] == connid:
            deleted = cancel_game(connid, gameid)
            if deleted:
                post = {
                    'action': 'cancelgame',
                    'id': gameid
                }
                send(ctx, connid, post)
                if item['guest']:
                    send(ctx, item['guest'], post)
        else:
            print("No game found matching {} for host {}".format(
                gameid, connid))
    except Exception as e:
        print("Error while attempting to delete {}: {}.".format(gameid, e))

    response = {'statusCode': 200, 'body': 'Deleted.'}
    print(response)
    return response
