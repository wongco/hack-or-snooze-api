class APIError extends Error {
  constructor(
    message = 'Internal Server Error',
    status = 500,
    title = 'Error'
  ) {
    super(message);
    this.status = status;
    this.title = title;
  }

  /*
    Defines the JSON representation of this class
	 Automatically invoked when you pass an API Error to res.json
   */
  toJSON() {
    return {
      error: {
        status: this.status,
        title: this.title,
        message: this.message
      }
    };
  }
}

module.exports = APIError;
