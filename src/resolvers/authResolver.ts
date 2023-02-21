import { IUser, User } from '../model/user';
import { GraphQLError } from 'graphql';
import { genSalt, hash, compare } from 'bcrypt-ts';
import jwt from 'jsonwebtoken';

const authResolver = {
  Mutation: {
    registerUser: async (_: any, user: IUser) => {
      const { email, username, password } = user;

      const oldUser = await User.findOne({ email });

      if (oldUser) {
        throw new GraphQLError(
          'A user is already registered with the email ' + email,
          {
            extensions: {
              code: 'USER_ALREADY_EXISTS',
            },
          }
        );
      }

      const hashPassword = await genSalt(10).then((salt) =>
        hash(password, salt)
      );

      const newUser = new User({
        username: username,
        email: email,
        password: hashPassword,
      });

      const token = jwt.sign(
        {
          user_id: newUser._id,
          email,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: '2h',
        }
      );

      const res = await newUser.save();

      return { token: token, user: newUser };
    },
    loginUser: async (_: any, userInput: IUser) => {
      const { username, password } = userInput;

      const user = await User.findOne({ username });

      if (user && (await compare(password, user.password))) {
        const token = jwt.sign(
          {
            user_id: user._id,
            email: user.email,
          },
          process.env.SECRET_KEY,
          {
            expiresIn: '2h',
          }
        );

        return { token: token, user: user };
      } else {
        throw new GraphQLError('The user name or password are incorrect.', {
          extensions: {
            code: 'INVALID_LOGIN',
          },
        });
      }
    },
  },
};

export { authResolver };
