import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { User } from '../model/user';
import { authUtil } from '../utils';

function authDirectiveTransformer(schema: GraphQLSchema) {
  return mapSchema(schema, {
    // Executes once for each object field in the schema
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // Check whether this field has the specified directive
      const isLoggedInDirective = getDirective(
        schema,
        fieldConfig,
        'isLoggedIn'
      )?.[0];

      if (isLoggedInDirective) {
        // Get this field's original resolver
        const { resolve = defaultFieldResolver } = fieldConfig;

        // Replace the original resolver with a function that *first* calls
        // the original resolver, then converts its result to upper case
        fieldConfig.resolve = async function (source, args, context, info) {
          console.log(context);
          if (!context.token) {
            throw new Error('Please provde a Authorization Token');
          }

          const payload = authUtil.readTokenFromContext(context);
          const user = await User.findOne(payload._id);
          if (!user) {
            throw new Error('The token you provided cannot match a user');
          }
          const result = await resolve(source, args, context, info);

          return result;
        };
        return fieldConfig;
      }
    },
  });
}

export { authDirectiveTransformer };
