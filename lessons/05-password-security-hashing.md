# Password Security and Hashing - NestJS

## Password Security and Hashing

### Q: Why is password hashing essential in web applications?

**A:** Password hashing is crucial for user security and application integrity:

**Security reasons:**

- **Data Breach Protection**: Even if database is compromised, passwords remain secure
- **Compliance**: Meets security standards and regulations (GDPR, CCPA, etc.)
- **User Trust**: Protects user accounts from unauthorized access
- **Best Practices**: Industry standard for password storage

**What NOT to do:**

```typescript
// ❌ NEVER store passwords in plain text
const user = {
  email: 'user@example.com',
  password: 'mypassword123', // Extremely insecure!
};

// ❌ NEVER use simple encoding
const encodedPassword = Buffer.from('mypassword123').toString('base64');
```

### Q: How to implement secure password hashing with bcryptjs?

**A:** Use bcryptjs for secure password hashing in NestJS:

**1. Install bcryptjs:**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

**2. Basic password hashing service:**

```typescript
import { Injectable } from '@nestjs/common';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12; // Higher = more secure but slower

  /**
   * Generate a salt and hash password
   * @param password - Plain text password
   * @returns Hashed password
   */
  hashPassword(password: string): string {
    const salt = genSaltSync(this.saltRounds);
    return hashSync(password, salt);
  }

  /**
   * Compare plain password with hashed password
   * @param password - Plain text password
   * @param hashedPassword - Stored hashed password
   * @returns Boolean indicating if passwords match
   */
  comparePassword(password: string, hashedPassword: string): boolean {
    return compareSync(password, hashedPassword);
  }

  /**
   * Generate random salt
   * @returns Salt string
   */
  generateSalt(): string {
    return genSaltSync(this.saltRounds);
  }
}
```

### Q: How to integrate password hashing into the Users service?

**A:** Implement password hashing in the UsersService:

**1. Enhanced UsersService with password hashing:**

```typescript
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  /**
   * Generate hashed password with salt
   * @param password - Plain text password
   * @returns Hashed password
   */
  private generateHashPassword(password: string): string {
    const saltRounds = 12;
    const salt = genSaltSync(saltRounds);
    return hashSync(password, salt);
  }

  /**
   * Create new user with hashed password
   * @param createUserDto - User creation data
   * @returns Created user (without password)
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email,
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Hash password before saving
      const hashedPassword = this.generateHashPassword(createUserDto.password);

      const user = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  /**
   * Validate user credentials
   * @param loginDto - Login credentials
   * @returns User if credentials are valid
   */
  async validateUser(
    loginDto: LoginUserDto,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.userModel
        .findOne({
          email: loginDto.email,
        })
        .select('+password'); // Include password for comparison

      if (!user) {
        return null;
      }

      // Compare provided password with stored hash
      const isPasswordValid = compareSync(loginDto.password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw new BadRequestException('Failed to validate user');
    }
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Success message
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findById(userId).select('+password');

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = compareSync(
        currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = this.generateHashPassword(newPassword);

      // Update password
      await this.userModel.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
        updatedAt: new Date(),
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to change password');
    }
  }
}
```

### Q: How to create DTOs for authentication?

**A:** Create specialized DTOs for login and password management:

**1. LoginUserDto:**

```typescript
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
```

**2. ChangePasswordDto:**

```typescript
import { IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  newPassword: string;

  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword: string;

  // Custom validation to ensure passwords match
  @Validate(PasswordMatchValidator)
  passwordsMatch: boolean;
}
```

**3. Custom password match validator:**

```typescript
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
export class PasswordMatchValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const dto = args.object as ChangePasswordDto;
    return dto.newPassword === dto.confirmPassword;
  }

  defaultMessage(args: ValidationArguments) {
    return 'New password and confirmation password do not match';
  }
}
```

### Q: How to configure bcrypt salt rounds for optimal security?

**A:** Choose appropriate salt rounds based on security requirements and performance:

**1. Salt rounds configuration service:**

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityConfigService {
  constructor(private configService: ConfigService) {}

  /**
   * Get salt rounds from environment or use default
   * Higher rounds = more secure but slower
   */
  getSaltRounds(): number {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS');

    // Default to 12 if not specified
    // 10 = ~10ms, 12 = ~150ms, 14 = ~2s, 16 = ~30s
    return saltRounds || 12;
  }

  /**
   * Get password policy requirements
   */
  getPasswordPolicy() {
    return {
      minLength: this.configService.get<number>('PASSWORD_MIN_LENGTH') || 8,
      requireUppercase:
        this.configService.get<boolean>('PASSWORD_REQUIRE_UPPERCASE') ?? true,
      requireLowercase:
        this.configService.get<boolean>('PASSWORD_REQUIRE_LOWERCASE') ?? true,
      requireNumbers:
        this.configService.get<boolean>('PASSWORD_REQUIRE_NUMBERS') ?? true,
      requireSpecialChars:
        this.configService.get<boolean>('PASSWORD_REQUIRE_SPECIAL') ?? true,
    };
  }
}
```

**2. Environment configuration (.env):**

```env
# Security Configuration
BCRYPT_SALT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true
```

**3. Performance vs Security guidelines:**

```typescript
/**
 * Salt Rounds Performance Guide:
 *
 * Rounds | Time     | Security Level | Use Case
 * -------|----------|----------------|----------
 * 8      | ~5ms     | Minimal        | Development only
 * 10     | ~10ms    | Basic          | Low-security apps
 * 12     | ~150ms   | Good           | Most web apps (recommended)
 * 14     | ~2s      | High           | High-security systems
 * 16     | ~30s     | Very High      | Critical security apps
 */
const SALT_ROUNDS = {
  DEVELOPMENT: 8,
  PRODUCTION_LOW: 10,
  PRODUCTION_STANDARD: 12,
  HIGH_SECURITY: 14,
  CRITICAL: 16,
};
```

### Q: How to implement password strength validation?

**A:** Create comprehensive password strength validation:

**1. Password strength validator:**

```typescript
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'passwordStrength', async: false })
export class PasswordStrengthValidator implements ValidatorConstraintInterface {
  validate(password: string): boolean {
    if (!password) return false;

    // Check minimum length
    if (password.length < 8) return false;

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) return false;

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) return false;

    // Check for at least one digit
    if (!/\d/.test(password)) return false;

    // Check for at least one special character
    if (!/[@$!%*?&]/.test(password)) return false;

    // Check for common weak passwords
    const weakPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
    ];

    if (weakPasswords.includes(password.toLowerCase())) return false;

    return true;
  }

  defaultMessage(): string {
    return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: PasswordStrengthValidator,
    });
  };
}
```

**2. Password strength checker service:**

```typescript
@Injectable()
export class PasswordStrengthService {
  /**
   * Calculate password strength score (0-100)
   * @param password - Password to analyze
   * @returns Strength score and feedback
   */
  calculateStrength(password: string): {
    score: number;
    strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
    feedback: string[];
  } {
    if (!password) {
      return {
        score: 0,
        strength: 'very-weak',
        feedback: ['Password is required'],
      };
    }

    let score = 0;
    const feedback: string[] = [];

    // Length scoring
    if (password.length >= 8) score += 20;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score += 10;
    else feedback.push('Consider using 12+ characters');

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 15;
    else feedback.push('Add numbers');

    if (/[@$!%*?&]/.test(password)) score += 15;
    else feedback.push('Add special characters (@$!%*?&)');

    // Pattern variety
    if (!/(.)\1{2,}/.test(password)) score += 10;
    else feedback.push('Avoid repeated characters');

    // Common password check
    const commonPasswords = ['password', '123456', 'qwerty'];
    if (
      !commonPasswords.some((common) => password.toLowerCase().includes(common))
    ) {
      score += 10;
    } else {
      feedback.push('Avoid common passwords');
    }

    // Determine strength level
    let strength: 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';
    if (score < 30) strength = 'very-weak';
    else if (score < 50) strength = 'weak';
    else if (score < 70) strength = 'fair';
    else if (score < 90) strength = 'strong';
    else strength = 'very-strong';

    return { score, strength, feedback };
  }
}
```

### Q: How to handle password reset functionality securely?

**A:** Implement secure password reset with tokens:

**1. Password reset service:**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
  ) {}

  /**
   * Generate password reset token
   * @param email - User email
   * @returns Success message
   */
  async generateResetToken(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If email exists, reset link has been sent' };
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiration (15 minutes)
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save hashed token to database
    await this.userModel.findByIdAndUpdate(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: tokenExpiry,
    });

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'If email exists, reset link has been sent' };
  }

  /**
   * Reset password using token
   * @param token - Reset token
   * @param newPassword - New password
   * @returns Success message
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await this.userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 12;
    const salt = genSaltSync(saltRounds);
    const hashedPassword = hashSync(newPassword, salt);

    // Update password and clear reset token
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      updatedAt: new Date(),
    });

    return { message: 'Password reset successful' };
  }
}
```

### Q: Best practices for password security?

**A:** Follow these security best practices:

**1. Security implementation checklist:**

```typescript
/**
 * Password Security Checklist:
 *
 * ✅ Use bcrypt with appropriate salt rounds (12+)
 * ✅ Never store passwords in plain text
 * ✅ Validate password strength on client and server
 * ✅ Implement secure password reset flow
 * ✅ Use HTTPS for all authentication endpoints
 * ✅ Rate limit login attempts
 * ✅ Hash passwords before database storage
 * ✅ Remove passwords from API responses
 * ✅ Implement proper session management
 * ✅ Use environment variables for sensitive config
 */
```

**2. Schema configuration for password security:**

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false }) // Hide password by default
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ select: false }) // Hide reset token
  passwordResetToken?: string;

  @Prop({ select: false }) // Hide reset expiry
  passwordResetExpires?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for password reset functionality
UserSchema.index({ passwordResetToken: 1 });
UserSchema.index({ passwordResetExpires: 1 });
```

**3. Rate limiting for authentication:**

```typescript
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Track by IP and email for login attempts
    return `${req.ip}-${req.body?.email || 'unknown'}`;
  }
}

// Use in controller
@UseGuards(AuthThrottlerGuard)
@Throttle(5, 60) // 5 attempts per minute
@Post('login')
async login(@Body() loginDto: LoginUserDto) {
  return this.authService.login(loginDto);
}
```
