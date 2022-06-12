import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic
const logger = createLogger('todos')
const todoAccess = new TodosAccess()
const dataUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info(`Get all todos for user ${userId}`, { userId })
  return await todoAccess.getTodoByUser(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {

  const todoId = uuid.v4()
  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }

  logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })

  await todoAccess.createTodo(newItem)

  return newItem
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`Delete todo ${todoId}`, { todoId })
  await todoAccess.deleteTodo(userId, todoId)

}

export async function updateTodo(userId: string, todoId: string, updateTodo: UpdateTodoRequest) {
  logger.info(`Update todo ${todoId}`, { todoId })

  let item = await todoAccess.getTodoById(userId, todoId)

  todoAccess.updateTodoItem(userId, todoId, updateTodo as TodoUpdate)
}


export async function createAttachmentPresignedUrl(todoId: string, attachmentId: string) {
  logger.info(`Create s3 url for todo ${todoId} with id ${attachmentId}`, { todoId, attachmentId })
  let url = await dataUtils.getS3Url(attachmentId)
  logger.info(`Created url ${url}`, { url })
  return url
}



