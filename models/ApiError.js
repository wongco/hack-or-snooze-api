class APIError extends Error {
  constructor(message = 'Internal Server Error', status = 500) {
    super(message);
    this.status = status;
  }

  /*
    Defines the JSON representation of this class
	 Automatically invoked when you pass an API Error to res.json
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        status: this.status
      }
    };
  }
}

module.exports = APIError;
