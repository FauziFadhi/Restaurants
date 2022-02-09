export class HttpException extends Error {
  response: any;
  statusCode: number;
  constructor(response: string | { message: string }, status: number) {
    super();
    this.response = response;
    this.statusCode = status;
    this.initMessage();
  }

  initMessage() {
    if (typeof this.response == 'string') {
      this.message = this.response;
    } else if (typeof this.response == 'object') {
      this.message = this.response.message;
    }
  }
}
