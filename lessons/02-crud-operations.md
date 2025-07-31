# CRUD Operations - NestJS

## CRUD Operations

### Q: How are CRUD operations implemented in the Users module?

**A:** CRUD operations are divided between Controller (HTTP layer) and Service (business logic):

**Controller** (`users.controller.ts`):

```typescript
@Controller('users')
export class UsersController {
  @Post()
  create(
    // @Body('email') tương đương với const email: string = req.body.email
    // Decorator này trích xuất giá trị 'email' từ request body và gán vào parameter
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

### Q: What are the key decorators used in CRUD controllers?

**A:** Common NestJS decorators for CRUD operations:

1. **@Body() Decorators**:

   ```typescript
   // Lấy toàn bộ request body
   @Body() createUserDto: CreateUserDto

   // Lấy một field cụ thể từ request body
   // @Body('email') tương đương với const email = req.body.email
   @Body('email') email: string
   ```

2. **@Param() Decorator**:

   ```typescript
   // Lấy parameter từ URL path
   // @Param('id') tương đương với const id = req.params.id
   @Get(':id')
   findOne(@Param('id') id: string) { ... }
   ```

3. **HTTP Method Decorators**:
   ```typescript
   @Get()     // GET request
   @Post()    // POST request
   @Patch()   // PATCH request (partial update)
   @Put()     // PUT request (full update)
   @Delete()  // DELETE request
   ```

### Q: How to implement proper error handling in CRUD operations?

**A:** Best practices for error handling in NestJS:

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class UsersService {
  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException
      }
      throw new BadRequestException('Invalid user ID format');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.userModel.create(createUserDto);
      return user;
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error
        throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
```

### Q: How to implement complete CRUD operations with proper validation?

**A:** Complete implementation example:

**DTO with validation**:

```typescript
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsNumber({}, { message: 'Age must be a number' })
  age?: number;

  @IsOptional()
  address?: string;
}
```

**Complete Service Implementation**:

```typescript
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.userModel.create({
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid user ID format');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(
          id,
          { ...updateUserDto, updatedAt: new Date() },
          { new: true },
        )
        .exec();

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: string): Promise<{ deleted: boolean; message: string }> {
    try {
      const result = await this.userModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return {
        deleted: true,
        message: `User with ID ${id} has been deleted successfully`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }
}
```
