# Data Validation and DTOs - NestJS

## Data Validation and DTOs

### Q: What are DTOs and why are they important in NestJS?

**A:** DTOs (Data Transfer Objects) are TypeScript classes that define the shape and validation rules for data being transferred between different layers of your application.

**Key benefits:**

- **Type Safety**: Ensure data conforms to expected structure
- **Validation**: Automatic validation of incoming requests
- **Documentation**: Self-documenting API contracts
- **Security**: Prevent unwanted data from reaching your application
- **Transformation**: Clean and transform data before processing

### Q: How to implement proper validation with class-validator?

**A:** NestJS integrates seamlessly with `class-validator` for robust data validation:

**1. Basic DTO with validation decorators:**

```typescript
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password cannot exceed 20 characters' })
  password: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @IsString()
  address?: string;
}
```

**2. Enable global validation in main.ts:**

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true, // Automatically transform payloads
    }),
  );

  await app.listen(3000);
}
```

### Q: How to handle different validation scenarios?

**A:** Different validation decorators for various use cases:

**1. String Validations:**

```typescript
export class CreatePostDto {
  @IsNotEmpty()
  @MinLength(5, { message: 'Title must be at least 5 characters' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  title: string;

  @IsOptional()
  @Length(10, 500, { message: 'Content must be between 10 and 500 characters' })
  content?: string;

  @IsUrl({}, { message: 'Please provide a valid URL' })
  @IsOptional()
  imageUrl?: string;
}
```

**2. Number Validations:**

```typescript
export class CreateProductDto {
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  @Max(10000, { message: 'Price cannot exceed 10000' })
  price: number;

  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
```

**3. Date and Boolean Validations:**

```typescript
export class CreateEventDto {
  @IsDateString({}, { message: 'Please provide a valid date' })
  startDate: string;

  @IsBoolean({ message: 'IsPublic must be a boolean value' })
  isPublic: boolean;
}
```

### Q: How to create Update DTOs efficiently?

**A:** Use NestJS mapped types to create Update DTOs from Create DTOs:

**1. PartialType - Makes all properties optional:**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
// All properties from CreateUserDto become optional
```

**2. PickType - Select specific properties:**

```typescript
import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateProfileDto extends PickType(CreateUserDto, [
  'name',
  'address',
] as const) {}
// Only name and address are included
```

**3. OmitType - Exclude specific properties:**

```typescript
import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends OmitType(CreateUserDto, [
  'password',
] as const) {}
// All properties except password
```

**4. IntersectionType - Combine multiple DTOs:**

```typescript
import { IntersectionType } from '@nestjs/mapped-types';

export class CreateUserWithProfileDto extends IntersectionType(
  CreateUserDto,
  CreateProfileDto,
) {}
// Combines properties from both DTOs
```

### Q: How to implement custom validation decorators?

**A:** Create custom validators for specific business logic:

**1. Custom validation decorator:**

```typescript
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  defaultMessage() {
    return 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
```

**2. Using custom validator:**

```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
  name: string;
}
```

### Q: How to handle validation errors gracefully?

**A:** Implement proper error handling and formatting:

**1. Custom validation pipe with detailed errors:**

```typescript
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = this.formatErrors(errors);
        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    });
  }

  private formatErrors(errors: ValidationError[]): any[] {
    return errors.map((error) => ({
      field: error.property,
      value: error.value,
      constraints: error.constraints,
    }));
  }
}
```

**2. Using in main.ts:**

```typescript
app.useGlobalPipes(new CustomValidationPipe());
```

### Q: How to validate nested objects and arrays?

**A:** Handle complex data structures with nested validation:

**1. Nested object validation:**

```typescript
import { ValidateNested, Type } from 'class-validator';

export class AddressDto {
  @IsNotEmpty()
  street: string;

  @IsNotEmpty()
  city: string;

  @IsPostalCode('US')
  zipCode: string;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

**2. Array validation:**

```typescript
import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one tag is required' })
  @ArrayMaxSize(5, { message: 'Maximum 5 tags allowed' })
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentDto)
  comments: CommentDto[];
}
```

### Q: How to implement conditional validation?

**A:** Use conditional validation for complex business rules:

**1. ValidateIf decorator:**

```typescript
import { ValidateIf } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  customerType: 'individual' | 'business';

  @ValidateIf((o) => o.customerType === 'business')
  @IsNotEmpty({ message: 'Company name is required for business customers' })
  companyName?: string;

  @ValidateIf((o) => o.customerType === 'business')
  @IsNotEmpty({ message: 'Tax ID is required for business customers' })
  taxId?: string;
}
```

**2. Custom conditional validator:**

```typescript
@ValidatorConstraint({ async: false })
export class IsRequiredWhenConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName, relatedValue] = args.constraints;
    const relatedPropertyValue = (args.object as any)[relatedPropertyName];

    if (relatedPropertyValue === relatedValue) {
      return value !== undefined && value !== null && value !== '';
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName, relatedValue] = args.constraints;
    return `${args.property} is required when ${relatedPropertyName} is ${relatedValue}`;
  }
}

export function IsRequiredWhen(
  property: string,
  value: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property, value],
      validator: IsRequiredWhenConstraint,
    });
  };
}
```

### Q: How to validate file uploads?

**A:** Implement validation for file uploads using multer and custom validators:

**1. File validation DTO:**

```typescript
import { IsOptional, IsIn } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsIn(['image/jpeg', 'image/png', 'image/gif'], {
    message: 'Only JPEG, PNG and GIF files are allowed',
  })
  mimetype?: string;

  @IsOptional()
  @Max(5000000, { message: 'File size cannot exceed 5MB' })
  size?: number;
}
```

**2. File validation decorator:**

```typescript
@ValidatorConstraint({ async: false })
export class IsImageFileConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File) {
    if (!file) return true; // Let @IsOptional handle undefined

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedMimeTypes.includes(file.mimetype) && file.size <= maxSize;
  }

  defaultMessage() {
    return 'File must be an image (JPEG, PNG, GIF) and not exceed 5MB';
  }
}

export function IsImageFile(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsImageFileConstraint,
    });
  };
}
```

### Q: Best practices for DTOs and validation?

**A:** Follow these best practices for maintainable validation:

**1. Organize DTOs by feature:**

```
src/
  users/
    dto/
      create-user.dto.ts
      update-user.dto.ts
      user-response.dto.ts
  posts/
    dto/
      create-post.dto.ts
      update-post.dto.ts
```

**2. Use meaningful error messages:**

```typescript
export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required and cannot be empty' })
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;
}
```

**3. Create reusable validation groups:**

```typescript
export class CreateUserDto {
  @IsEmail({}, { groups: ['registration'] })
  email: string;

  @IsNotEmpty({ groups: ['registration', 'update'] })
  name: string;

  @MinLength(8, { groups: ['registration'] })
  password: string;
}

// Use in controller
@Post()
async create(@Body(new ValidationPipe({ groups: ['registration'] })) dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

**4. Document your DTOs:**

```typescript
/**
 * DTO for creating a new user account
 * Used in registration endpoint
 */
export class CreateUserDto {
  /** User's email address - must be unique */
  @IsEmail()
  email: string;

  /** User's password - minimum 8 characters */
  @MinLength(8)
  password: string;

  /** User's display name */
  @IsNotEmpty()
  name: string;
}
```
