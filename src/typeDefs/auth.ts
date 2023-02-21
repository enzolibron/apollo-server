const auth = `#graphql

  type User {
    username: String
    email: String
    _id: String
  }

  type Token {
    token: String
    user: User
  }

  type Mutation {
    registerUser(username: String, email: String, password:String): Token
    loginUser(username: String, password: String): Token
  }
`;

export { auth };
