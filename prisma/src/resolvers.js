const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const resolvers = {
  Query: {
    currentUser: (root, args, context) => {
      // this if statement is our authentication check
      if (!context.user) {
        throw new Error("Not Authenticated");
      }
      return context.prisma.user({ id: context.user.id });
    }
  },
  Mutation: {
    register: async (root, args, context) => {
      const hashedPassword = await bcrypt.hash(args.password, 10);
      const user = await context.prisma.createUser({
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        password: hashedPassword
      });
      return user;
    },
    login: async (root, args, context) => {
      const user = await context.prisma.user({ email: args.email });

      if (!user) {
        throw new Error("Invalid Login");
      }

      const passwordMatch = await bcrypt.compare(args.password, user.password);

      if (!passwordMatch) {
        throw new Error("Invalid Login");
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.email
        },
        "my-secret-from-env-file-in-prod",
        {
          expiresIn: "30d" // token will expire in 30days
        }
      );
      return {
        token,
        user
      };
    }
  }
};

module.exports = { resolvers };
