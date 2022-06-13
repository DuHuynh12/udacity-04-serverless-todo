import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

  constructor(
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todoIndex = process.env.TODOS_CREATED_AT_INDEX
  ) { }

  async createTodo(todoItem: TodoItem) {
    logger.info(`Create todo ${todoItem.todoId} into ${this.todosTable}`)

    await docClient.put({
      TableName: this.todosTable,
      Item: todoItem,
    }).promise()

  }

  async getTodoByUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting todos for user ${userId} from ${this.todosTable}`)

    const ret = await docClient.query({
      TableName: this.todosTable,
      IndexName: this.todoIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    return ret.Items as TodoItem[]
  }

  async getTodoById(userId:string, todoId: string): Promise<TodoItem> {
    logger.info(`Get todo by id${todoId} from ${this.todosTable}`)

    const ret = await docClient.get({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    }).promise()

    return ret.Item as TodoItem
  }

  async updateTodoItem(userId:string, todoId: string, todoUpdate: TodoUpdate) {
    logger.info(`Updating todo item ${todoId} in ${this.todosTable}`)

    let params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": todoUpdate.name,
        ":dueDate": todoUpdate.dueDate,
        ":done": todoUpdate.done
      }
    }

    await docClient.update(params).promise()
  }

  async deleteTodo(userId:string, todoId: string) {
    logger.info(`Delete todo item ${todoId} from ${this.todosTable}`)

    await docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    }).promise()
  }

  async updateS3Url(userId:string, todoId: string, attachmentUrl: string) {
    logger.info(`Updating attachment URL for todo ${todoId} in ${this.todosTable}`)

    let params = {
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }

    await docClient.update(params).promise()
  }

}