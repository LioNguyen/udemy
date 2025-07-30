# NestJS Fundamentals - A Complete Guide

## Table of Contents

1. [Core NestJS Architecture](#core-nestjs-architecture)
2. [MongoDB Integration](#mongodb-integration)
3. [CRUD Operations](#crud-operations)
4. [NestJS CLI Generator](#nestjs-cli-generator)
5. [Best Practices](#best-practices)

---

## Core NestJS Architecture

### Q: What are the main building blocks of a NestJS application?

**A:** NestJS applications are built with three main components:

- **Controllers**: Handle incoming HTTP requests and return responses
- **Services**: Contain business logic and are injectable via dependency injection
- **Modules**: Organize and group related controllers and services together

### Q: How do Controllers, Services, and Modules work together?

**A:** The relationship follows this workflow:

1. **Module** acts as a container that:

   - Imports other modules and their dependencies
   - Declares controllers and providers (services)
   - Exports services for use in other modules

2. **Controller** handles HTTP requests:

   - Receives incoming requests through route decorators (`@Get()`, `@Post()`, etc.)
   - Delegates business logic to injected services
   - Returns formatted responses to the client

3. **Service** implements business logic:
   - Contains methods for data manipulation and processing
   - Interacts with databases through models/repositories
   - Can be injected into controllers and other services

**Example workflow for creating a user**:

```
HTTP POST /users → Controller.create() → Service.create() → Database → Response
```

### Q: How does dependency injection work between these components?

**A:** NestJS uses a powerful dependency injection system:

```typescript
// 1. Service is marked as injectable
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
}

// 2. Controller receives service through constructor injection
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}

// 3. Module connects everything together
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

### Q: What is the typical request flow in a NestJS application?

**A:** A typical request follows this path:

1. **HTTP Request** arrives at the application
2. **Middleware** processes the request (authentication, logging, etc.)
3. **Controller** receives the request through route handler
4. **Controller** calls appropriate **Service** method
5. **Service** performs business logic (validation, database operations)
6. **Service** returns data to **Controller**
7. **Controller** formats and returns **HTTP Response**

```typescript
// Example: Creating a new user
@Post()
async create(@Body() createUserDto: CreateUserDto) {
  // Controller delegates to service
  const user = await this.usersService.create(createUserDto);
  return { success: true, data: user };
}
```

### Q: How is the main application bootstrapped?

**A:** The application is bootstrapped in `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Static assets and view engine setup
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  await app.listen(configService.get<string>('PORT'));
}
```

### Q: What is the structure of the root AppModule?

**A:** The `AppModule` serves as the root module and includes:

- **MongoDB Connection**: Async configuration using environment variables
- **Global Configuration**: Makes ConfigModule available throughout the app
- **Feature Modules**: Imports UsersModule
- **Controllers & Providers**: Root-level app controller and service

```typescript
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

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

---

## CRUD Operations

### Q: How are CRUD operations implemented in the Users module?

**A:** CRUD operations are divided between Controller (HTTP layer) and Service (business logic):

**Controller** (`users.controller.ts`):

```typescript
@Controller('users')
export class UsersController {
  @Post()
  create(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('name') name: string,
  ) {
    return this.usersService.create(email, password, name);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

**Service** (`users.service.ts`):

```typescript
async create(email: string, password: string, name: string) {
  const user = await this.userModel.create({
    email,
    password,
    name,
  });
  return user;
}
```

### Q: What is the current state of CRUD implementation?

**A:** Current implementation status:

- ✅ **CREATE**: Fully implemented with MongoDB integration
- ⚠️ **READ**: `findAll()` returns placeholder text (needs implementation)
- ⚠️ **UPDATE**: Returns placeholder text (needs implementation)
- ⚠️ **DELETE**: Returns placeholder text (needs implementation)

### Q: What are DTOs and how are they used?

**A:** DTOs (Data Transfer Objects) define the shape of data for API requests:

- **CreateUserDto**: Currently empty class (needs implementation)
- **UpdateUserDto**: Extends CreateUserDto using `PartialType` from `@nestjs/mapped-types`

The `PartialType` utility makes all properties optional, perfect for update operations.

---

## NestJS CLI Generator

### Q: What is the NestJS CRUD generator and how does it work?

**A:** The NestJS CLI provides a powerful `nest g resource` command that automatically generates:

- Module (`nest g mo`)
- Controller (`nest g co`)
- Service (`nest g s`)
- Entity class/interface
- DTO classes (Create and Update)
- Test files (.spec files)

### Q: How do you use the CRUD generator?

**A:** Simple command to generate a complete resource:

```bash
$ nest g resource
```

The CLI will prompt you to choose:

- **Transport layer**: REST API, GraphQL (code first), GraphQL (schema first), Microservice, WebSocket Gateway
- **CRUD entry points**: Whether to generate CRUD endpoints

### Q: What does the generator create for REST API?

**A:** For REST API, it generates:

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

### Q: How can you skip generating test files?

**A:** Use the `--no-spec` flag:

```bash
$ nest g resource users --no-spec
```

---

## Best Practices

### Q: What are the key architectural patterns used in this project?

**A:** The project follows several NestJS best practices:

1. **Module Organization**: Each feature has its own module (UsersModule)
2. **Separation of Concerns**: Controllers handle HTTP, Services handle business logic
3. **Dependency Injection**: Proper use of NestJS DI system
4. **Configuration Management**: Centralized config using ConfigModule
5. **Schema-First Database Design**: Mongoose schemas define data structure

### Q: What improvements could be made to this codebase?

**A:** Potential improvements:

1. **Complete CRUD Implementation**:

   - Implement `findAll()`, `update()`, and `remove()` methods in UsersService
   - Use proper MongoDB queries with error handling

2. **DTO Implementation**:

   - Define proper CreateUserDto with validation decorators
   - Add validation pipes for request validation

3. **Error Handling**:

   - Add try-catch blocks in service methods
   - Implement proper HTTP exception handling

4. **Type Safety**:

   - Use DTOs instead of individual parameters in controller methods
   - Proper typing for MongoDB document IDs

5. **Validation**:
   - Add class-validator decorators to DTOs
   - Use ValidationPipe globally

### Q: How should DTOs be properly implemented?

**A:** Example of proper DTO implementation:

```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  address?: string;
}
```

### Q: What is the recommended way to handle MongoDB operations?

**A:** Best practices for MongoDB operations:

```typescript
async findAll(): Promise<User[]> {
  try {
    return await this.userModel.find().exec();
  } catch (error) {
    throw new InternalServerErrorException('Failed to fetch users');
  }
}

async findOne(id: string): Promise<User> {
  try {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  } catch (error) {
    throw new BadRequestException('Invalid user ID');
  }
}
```

---

## SQL vs NoSQL: Entities and Schemas

### Q: What is the difference between entities in SQL and schemas in NoSQL?

**A:** In NestJS, the choice between SQL and NoSQL databases affects how data models are defined:

1. **SQL Databases (e.g., PostgreSQL, MySQL)**:

   - Use **Entities** to define the structure of database tables.
   - Entities are classes decorated with `@Entity()` and other decorators like `@Column()`.
   - Example:

     ```typescript
     @Entity()
     export class User {
       @PrimaryGeneratedColumn()
       id: number;

       @Column()
       email: string;

       @Column()
       password: string;

       @Column()
       name: string;
     }
     ```

2. **NoSQL Databases (e.g., MongoDB)**:

   - Use **Schemas** to define the structure of collections.
   - Schemas are decorated with `@Schema()` and `@Prop()`.
   - Example:

     ```typescript
     @Schema()
     export class User {
       @Prop({ required: true })
       email: string;

       @Prop({ required: true })
       password: string;

       @Prop()
       name: string;
     }
     ```

**Key Differences**:

- **SQL Entities** map directly to relational database tables.
- **NoSQL Schemas** define the structure of documents in collections.
- SQL relies on relationships (foreign keys), while NoSQL uses embedded documents or references.

---

## Summary

This NestJS project demonstrates fundamental concepts including:

- **Modular Architecture**: Clean separation of concerns with modules
- **MongoDB Integration**: Using Mongoose for database operations
- **CRUD Operations**: Basic implementation with room for improvement
- **Configuration Management**: Environment-based configuration
- **Static File Serving**: Integration with EJS template engine

The codebase serves as a solid foundation for learning NestJS fundamentals, with clear opportunities for enhancement in areas like validation, error handling, and complete CRUD implementation.
