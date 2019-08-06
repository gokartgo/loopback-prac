import {Request, RestBindings, get, ResponseObject} from '@loopback/rest';
import {inject} from '@loopback/context';
import MyTree from '../lib/MyTree';
import {TodoRepository} from '../repositories';
import {repository} from '@loopback/repository';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @repository(TodoRepository) public todoRepository: TodoRepository,
  ) {}

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers

    const todos = new Promise((res, rej) => {
      res(this.todoRepository.find());
    });

    return todos.then(todo => {
      return {
        greeting: 'Hello from LoopBack',
        date: new Date(),
        url: this.req.url,
        headers: Object.assign({}, this.req.headers),
        todoList: todo,
      };
    });
  }

  @get('/pong', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  pong(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      status: 200,
      time: new Date(),
      tree: new MyTree().traverseTree(),
    };
  }
}
