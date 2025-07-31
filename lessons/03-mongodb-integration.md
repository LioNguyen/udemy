# MongoDB Integration - NestJS

## MongoDB Integration

### Q: How is MongoDB integrated with NestJS?

**A:** MongoDB integration is achieved through:

1. **Schema Definition** (`user.schema.ts`):

```typescript
@Schema()
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  address: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
```

2. **Model Injection** in Service:

```typescript
constructor(
  @InjectModel(User.name)
  private userModel: Model<User>,
) {}
```

### Q: What are the benefits of using Mongoose with NestJS?

**A:** Benefits include:

- **Type Safety**: TypeScript integration with schema definitions
- **Decorators**: Clean, declarative schema definition using `@Schema()` and `@Prop()`
- **Dependency Injection**: Seamless integration with NestJS DI system
- **Validation**: Built-in validation at the schema level
- **Middleware**: Support for pre/post hooks

### Q: How to set up MongoDB connection in AppModule?

**A:** MongoDB connection is configured in the root module using async configuration:

```typescript
@Module({
  imports: [
    // Async MongoDB connection using environment variables
    MongooseModule.forRootAsync({
      // Import ConfigModule to use ConfigService
      imports: [ConfigModule],

      // useFactory: Factory function to create dynamic connection configuration
      // Allows using async/await and inject dependencies
      useFactory: async (configService: ConfigService) => ({
        // Get MongoDB connection URI from .env file
        uri: configService.get<string>('MONGODB_URI'),
      }),

      // inject: List of dependencies to inject into useFactory
      // ConfigService will be injected as parameter to useFactory
      inject: [ConfigService],
    }),

    // Configure ConfigModule as global to use throughout the app
    ConfigModule.forRoot({ isGlobal: true }),

    // Import other feature modules
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Key points**:

- **MongooseModule.forRootAsync()**: Used for dynamic configuration instead of static `forRoot()`
- **ConfigService injection**: Inject ConfigService to access environment variables safely
- **Environment variables**: Connection string is stored in `.env` file as `MONGODB_URI`
- **Async factory**: Allows using async/await for more complex initialization logic

### Q: How to create and register a Mongoose schema?

**A:** Step-by-step schema creation and registration:

### Q: Detailed MongoDB import patterns in NestJS

**A:** There are 3 levels of MongoDB imports in NestJS:

1. **Root Level (AppModule)** - Global connection:

```typescript
// Database connection for the entire application
MongooseModule.forRootAsync({
  // Main connection configuration
});
```

2. **Feature Level (Feature Module)** - Schema registration:

```typescript
// Register schemas for each feature module
MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]);
```

3. **Service Level** - Model injection:

```typescript
// Inject model into service for usage
@InjectModel(User.name) private userModel: Model<UserDocument>
```

### Q: Difference between forRoot() and forRootAsync()

**A:** Two ways to initialize MongoDB connection:

**1. forRoot() - Static configuration:**

```typescript
// Use when you have a fixed connection string
MongooseModule.forRoot('mongodb://localhost:27017/nestjs-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Pros: Simple, fast
// Cons: Not flexible, hardcoded connection string
```

**2. forRootAsync() - Dynamic configuration:**

```typescript
// Use when you need configuration from environment variables or config service
MongooseModule.forRootAsync({
  imports: [ConfigModule], // Import required dependencies
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'), // Get from .env
    // Can add other complex logic
  }),
  inject: [ConfigService], // Inject dependencies into factory
});

// Pros: Flexible, secure, can be async
// Cons: Slightly more complex
```

**When to use:**

- **forRoot()**: Simple development, fixed connection string
- **forRootAsync()**: Production, using environment variables, need complex logic

### Q: How to create and register a Mongoose schema?

**A:** Step-by-step schema creation and registration:

1. **Create Schema Class** (`user.schema.ts`):

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ min: 0, max: 120 })
  age: number;

  @Prop()
  address: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

2. **Register Schema in Module** (`users.module.ts`):

```typescript
@Module({
  imports: [
    // Register schema for specific feature module
    MongooseModule.forFeature([
      {
        name: User.name, // Model name (will be 'User')
        schema: UserSchema, // Schema created from SchemaFactory
      },
    ]),
    // Can register multiple schemas at once:
    // { name: Profile.name, schema: ProfileSchema },
    // { name: Post.name, schema: PostSchema }
  ],
  controllers: [UsersController],
  providers: [UsersService],
  // exports: [UsersService], // Export service to use in other modules
})
export class UsersModule {}
```

3. **Inject Model in Service** (`users.service.ts`):

```typescript
@Injectable()
export class UsersService {
  constructor(
    // @InjectModel(): Decorator to inject Mongoose model
    // User.name: Name of the model (same name registered in module)
    // Model<UserDocument>: Type of model for type safety
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Create new model instance
    const createdUser = new this.userModel(createUserDto);
    // Save to database
    return createdUser.save();
  }

  // Or use static method create()
  async createAlternative(createUserDto: CreateUserDto): Promise<User> {
    // Create and save document in one step
    return this.userModel.create(createUserDto);
  }
}
```

### Q: What are advanced Mongoose features in NestJS?

**A:** Advanced Mongoose features and patterns:

1. **Schema Validation**:

```typescript
@Schema()
export class User {
  @Prop({
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  })
  email: string;

  @Prop({
    required: true,
    minlength: 6,
    maxlength: 100,
  })
  password: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  })
  name: string;

  @Prop({
    min: [0, 'Age cannot be negative'],
    max: [120, 'Age cannot exceed 120'],
  })
  age: number;
}
```

2. **Pre/Post Hooks (Middleware)**:

```typescript
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook to hash password
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save hook to update timestamp
UserSchema.pre<UserDocument>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Instance method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

3. **Virtual Properties**:

```typescript
// Add virtual property for full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password; // Remove password from JSON output
    return ret;
  },
});
```

4. **Custom Static Methods**:

```typescript
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email });
};

// Usage in service
const user = await this.userModel.findByEmail('user@example.com');
```

5. **Indexing for Performance**:

```typescript
@Schema()
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ index: true })
  name: string;

  @Prop({ index: true })
  createdAt: Date;
}

// Or add compound indexes
UserSchema.index({ email: 1, name: 1 });
UserSchema.index({ createdAt: -1 }); // Descending order
```

### Q: How to handle MongoDB connection errors and best practices?

**A:** Error handling and best practices for MongoDB in NestJS:

1. **Connection Error Handling**:

```typescript
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // Connection URI from environment variable
        uri: configService.get<string>('MONGODB_URI'),

        // Recommended options for production
        useNewUrlParser: true, // Use new URL parser
        useUnifiedTopology: true, // Use new topology engine
        retryWrites: true, // Automatically retry write operations
        retryAttempts: 5, // Number of retry attempts on connection failure
        retryDelay: 1000, // Delay between retries (ms)

        // Factory to handle connection events
        connectionFactory: (connection) => {
          // Event listeners to monitor connection
          connection.on('connected', () => {
            console.log('MongoDB connected successfully');
          });
          connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
          });
          connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

2. **Service Error Handling**:

```typescript
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = new this.userModel(createUserDto);
      return await user.save();
    } catch (error) {
      if (error.code === 11000) {
        // Handle duplicate key error
        throw new ConflictException('Email already exists');
      }
      if (error.name === 'ValidationError') {
        // Handle validation errors
        const messages = Object.values(error.errors).map((err) => err.message);
        throw new BadRequestException(
          `Validation failed: ${messages.join(', ')}`,
        );
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.name === 'CastError') {
        throw new BadRequestException('Invalid ID format');
      }
      throw new InternalServerErrorException('Failed to find user');
    }
  }
}
```

3. **Best Practices**:

```typescript
// Use transactions for multiple operations
async createUserWithProfile(userData: CreateUserDto, profileData: any) {
  const session = await this.userModel.db.startSession();

  try {
    session.startTransaction();

    const user = await this.userModel.create([userData], { session });
    const profile = await this.profileModel.create([{
      ...profileData,
      userId: user[0]._id
    }], { session });

    await session.commitTransaction();
    return { user: user[0], profile: profile[0] };
  } catch (error) {
    await session.abortTransaction();
    throw new InternalServerErrorException('Failed to create user and profile');
  } finally {
    session.endSession();
  }
}

// Use aggregation for complex queries
async getUsersWithStats(): Promise<any[]> {
  return this.userModel.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        averageAge: { $avg: '$age' },
        oldestUser: { $max: '$createdAt' },
        newestUser: { $min: '$createdAt' }
      }
    }
  ]);
}

// Use proper pagination
async findAllPaginated(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    this.userModel
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec(),
    this.userModel.countDocuments()
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
```

### Q: How to handle environment variables for MongoDB connection?

**A:** Environment configuration for MongoDB:

1. **Environment Variables** (`.env`):

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/nestjs-app
MONGODB_URI_TEST=mongodb://localhost:27017/nestjs-app-test

# MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name

# Additional MongoDB Options
MONGODB_MAX_POOL_SIZE=10
MONGODB_SERVER_SELECTION_TIMEOUT=5000
```

2. **Configuration Service** (`config/database.config.ts`):

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nestjs-app',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
    serverSelectionTimeoutMS:
      parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 5000,
    socketTimeoutMS: 45000,
    family: 4,
  },
}));
```

3. **Using Configuration in AppModule**:

```typescript
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        ...configService.get('database.options'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```
