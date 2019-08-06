import {get} from '@loopback/rest';

export class WhoAmIController {
  constructor() {}

  @get('/whoami')
  whoAmI(): object {
    return {
      success: true,
    };
  }
}
