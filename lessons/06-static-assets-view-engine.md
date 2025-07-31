# Static Assets and View Engine Integration - NestJS

## Static Assets and View Engine Integration

### Q: How does NestJS handle static assets and server-side rendering?

**A:** NestJS can serve static files and integrate with view engines for server-side rendering, making it versatile for both API and full-stack applications.

**Key concepts:**

- **Static Assets**: CSS, JavaScript, images, and other files served directly
- **View Engine**: Template rendering (EJS, Handlebars, Pug, etc.)
- **Server-Side Rendering**: Generate HTML on the server before sending to client
- **Hybrid Applications**: Combine API endpoints with rendered views

### Q: How to configure static asset serving in NestJS?

**A:** Configure static assets in the main.ts bootstrap function:

**1. Basic static assets configuration:**

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create NestExpressApplication for static assets support
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static assets from 'public' directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(3000);
}
bootstrap();
```

**2. Advanced static assets configuration:**

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static assets with custom prefix
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/', // Accessible at /static/css/style.css
  });

  // Serve multiple static directories
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useStaticAssets(join(__dirname, '..', 'assets'), {
    prefix: '/assets/',
  });

  await app.listen(3000);
}
```

**3. Static assets project structure:**

```
project-root/
├── public/
│   ├── css/
│   │   ├── styles.css
│   │   └── bootstrap.min.css
│   ├── js/
│   │   ├── app.js
│   │   └── jquery.min.js
│   ├── images/
│   │   ├── logo.png
│   │   └── favicon.ico
│   └── fonts/
├── uploads/
│   └── user-avatars/
└── src/
```

### Q: How to integrate EJS view engine with NestJS?

**A:** Configure EJS for server-side template rendering:

**1. Install EJS:**

```bash
npm install ejs
npm install -D @types/ejs
```

**2. Configure view engine in main.ts:**

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Set views directory
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Set view engine to EJS
  app.setViewEngine('ejs');

  await app.listen(3000);
}
bootstrap();
```

**3. Create view templates:**

```html
<!-- views/layouts/main.ejs -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= title || 'NestJS App' %></title>
    <link rel="stylesheet" href="/css/styles.css" />
    <link rel="stylesheet" href="/css/bootstrap.min.css" />
  </head>
  <body>
    <%- include('../partials/header') %>

    <main class="container"><%- body %></main>

    <%- include('../partials/footer') %>

    <script src="/js/jquery.min.js"></script>
    <script src="/js/app.js"></script>
  </body>
</html>
```

```html
<!-- views/partials/header.ejs -->
<header class="navbar navbar-expand-lg navbar-dark bg-primary">
  <div class="container">
    <a class="navbar-brand" href="/">
      <img src="/images/logo.png" alt="Logo" width="30" height="30" />
      NestJS App
    </a>
    <nav class="navbar-nav ms-auto">
      <% if (user) { %>
      <span class="navbar-text">Welcome, <%= user.name %>!</span>
      <a class="nav-link" href="/logout">Logout</a>
      <% } else { %>
      <a class="nav-link" href="/login">Login</a>
      <a class="nav-link" href="/register">Register</a>
      <% } %>
    </nav>
  </div>
</header>
```

**4. Create page templates:**

```html
<!-- views/home.ejs -->
<div class="hero-section">
  <h1>Welcome to <%= appName %></h1>
  <p class="lead"><%= message %></p>

  <% if (featuredPosts && featuredPosts.length > 0) { %>
  <div class="featured-posts">
    <h2>Featured Posts</h2>
    <div class="row">
      <% featuredPosts.forEach(post => { %>
      <div class="col-md-4">
        <div class="card mb-3">
          <% if (post.imageUrl) { %>
          <img
            src="<%= post.imageUrl %>"
            class="card-img-top"
            alt="<%= post.title %>"
          />
          <% } %>
          <div class="card-body">
            <h5 class="card-title"><%= post.title %></h5>
            <p class="card-text"><%= post.excerpt %></p>
            <a href="/posts/<%= post.id %>" class="btn btn-primary"
              >Read More</a
            >
          </div>
        </div>
      </div>
      <% }) %>
    </div>
  </div>
  <% } %>
</div>
```

### Q: How to create controllers that render views?

**A:** Use the @Render decorator to render templates from controllers:

**1. Basic view rendering controller:**

```typescript
import { Controller, Get, Render, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('home')
  getHome() {
    return {
      title: 'Home Page',
      appName: 'My NestJS App',
      message: this.appService.getWelcomeMessage(),
      user: null, // Would come from authentication
    };
  }

  @Get('about')
  @Render('about')
  getAbout() {
    return {
      title: 'About Us',
      companyInfo: {
        name: 'My Company',
        established: 2020,
        employees: 50,
      },
    };
  }
}
```

**2. Dynamic view rendering with data:**

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('users/index')
  async getUsersPage() {
    const users = await this.usersService.findAll();
    return {
      title: 'Users',
      users,
      totalUsers: users.length,
    };
  }

  @Get(':id')
  @Render('users/profile')
  async getUserProfile(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    const userPosts = await this.postsService.findByUserId(id);

    return {
      title: `${user.name}'s Profile`,
      user,
      posts: userPosts,
      isOwner: false, // Would check against current user
    };
  }

  @Get('new')
  @Render('users/create')
  getCreateUserForm() {
    return {
      title: 'Create New User',
      errors: null,
      formData: {},
    };
  }
}
```

**3. Form handling with view rendering:**

```typescript
import { Body, Post, Res, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  @Post()
  async createUser(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.create(createUserDto);

      // Redirect to success page
      res.redirect(`/users/${user.id}?created=true`);
    } catch (error) {
      // Render form with errors
      res.render('users/create', {
        title: 'Create New User',
        errors: this.formatValidationErrors(error),
        formData: createUserDto,
      });
    }
  }

  private formatValidationErrors(error: any) {
    // Extract validation errors for display
    if (error.response?.message && Array.isArray(error.response.message)) {
      return error.response.message;
    }
    return [error.message || 'An error occurred'];
  }
}
```

### Q: How to implement layout systems and partials?

**A:** Create reusable layout systems with EJS partials:

**1. Master layout with content blocks:**

```html
<!-- views/layouts/master.ejs -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= title %> | My App</title>

    <!-- CSS -->
    <link rel="stylesheet" href="/css/bootstrap.min.css" />
    <link rel="stylesheet" href="/css/styles.css" />

    <!-- Additional CSS from pages -->
    <% if (typeof additionalCSS !== 'undefined') { %> <%
    additionalCSS.forEach(css => { %>
    <link rel="stylesheet" href="<%= css %>" />
    <% }) %> <% } %>
  </head>
  <body class="<%= bodyClass || '' %>">
    <%- include('../partials/header', { user }) %>

    <!-- Flash messages -->
    <% if (typeof flashMessages !== 'undefined' && flashMessages.length > 0) {
    %>
    <div class="container mt-3">
      <% flashMessages.forEach(message => { %>
      <div class="alert alert-<%= message.type %> alert-dismissible fade show">
        <%= message.text %>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
        ></button>
      </div>
      <% }) %>
    </div>
    <% } %>

    <main class="<%= mainClass || 'container my-4' %>"><%- body %></main>

    <%- include('../partials/footer') %>

    <!-- JavaScript -->
    <script src="/js/bootstrap.bundle.min.js"></script>
    <script src="/js/app.js"></script>

    <!-- Additional JS from pages -->
    <% if (typeof additionalJS !== 'undefined') { %> <% additionalJS.forEach(js
    => { %>
    <script src="<%= js %>"></script>
    <% }) %> <% } %>
  </body>
</html>
```

**2. Reusable components:**

```html
<!-- views/partials/pagination.ejs -->
<% if (pagination && pagination.pages > 1) { %>
<nav aria-label="Page navigation">
  <ul class="pagination justify-content-center">
    <!-- Previous button -->
    <li class="page-item <%= pagination.page === 1 ? 'disabled' : '' %>">
      <a class="page-link" href="?page=<%= pagination.page - 1 %>">Previous</a>
    </li>

    <!-- Page numbers -->
    <% for (let i = 1; i <= pagination.pages; i++) { %>
    <li class="page-item <%= pagination.page === i ? 'active' : '' %>">
      <a class="page-link" href="?page=<%= i %>"><%= i %></a>
    </li>
    <% } %>

    <!-- Next button -->
    <li
      class="page-item <%= pagination.page === pagination.pages ? 'disabled' : '' %>"
    >
      <a class="page-link" href="?page=<%= pagination.page + 1 %>">Next</a>
    </li>
  </ul>
</nav>
<% } %>
```

```html
<!-- views/partials/user-card.ejs -->
<div class="card user-card">
  <% if (user.avatar) { %>
  <img src="<%= user.avatar %>" class="card-img-top" alt="<%= user.name %>" />
  <% } else { %>
  <div
    class="card-img-top bg-primary d-flex align-items-center justify-content-center"
  >
    <i class="fas fa-user fa-3x text-white"></i>
  </div>
  <% } %>
  <div class="card-body">
    <h5 class="card-title"><%= user.name %></h5>
    <p class="card-text"><%= user.email %></p>
    <% if (user.bio) { %>
    <p class="card-text"><small class="text-muted"><%= user.bio %></small></p>
    <% } %>
    <div class="d-flex justify-content-between">
      <a href="/users/<%= user.id %>" class="btn btn-primary">View Profile</a>
      <% if (canEdit) { %>
      <a href="/users/<%= user.id %>/edit" class="btn btn-outline-secondary"
        >Edit</a
      >
      <% } %>
    </div>
  </div>
</div>
```

### Q: How to handle forms and validation in view templates?

**A:** Create robust form handling with validation display:

**1. Form template with validation:**

```html
<!-- views/forms/user-form.ejs -->
<form method="POST" action="<%= action %>" enctype="multipart/form-data">
  <!-- CSRF protection (if implemented) -->
  <% if (typeof csrfToken !== 'undefined') { %>
  <input type="hidden" name="_token" value="<%= csrfToken %>" />
  <% } %>

  <!-- Email field -->
  <div class="mb-3">
    <label for="email" class="form-label">Email Address *</label>
    <input
      type="email"
      class="form-control <%= hasError('email') ? 'is-invalid' : '' %>"
      id="email"
      name="email"
      value="<%= formData.email || '' %>"
      required
    />
    <% if (hasError('email')) { %>
    <div class="invalid-feedback"><%= getError('email') %></div>
    <% } %>
  </div>

  <!-- Password field -->
  <div class="mb-3">
    <label for="password" class="form-label">Password *</label>
    <input
      type="password"
      class="form-control <%= hasError('password') ? 'is-invalid' : '' %>"
      id="password"
      name="password"
      required
    />
    <% if (hasError('password')) { %>
    <div class="invalid-feedback"><%= getError('password') %></div>
    <% } %>
    <div class="form-text">
      Password must be at least 8 characters long and contain uppercase,
      lowercase, number, and special character.
    </div>
  </div>

  <!-- Name field -->
  <div class="mb-3">
    <label for="name" class="form-label">Full Name *</label>
    <input
      type="text"
      class="form-control <%= hasError('name') ? 'is-invalid' : '' %>"
      id="name"
      name="name"
      value="<%= formData.name || '' %>"
      required
    />
    <% if (hasError('name')) { %>
    <div class="invalid-feedback"><%= getError('name') %></div>
    <% } %>
  </div>

  <!-- File upload -->
  <div class="mb-3">
    <label for="avatar" class="form-label">Profile Picture</label>
    <input
      type="file"
      class="form-control <%= hasError('avatar') ? 'is-invalid' : '' %>"
      id="avatar"
      name="avatar"
      accept="image/*"
    />
    <% if (hasError('avatar')) { %>
    <div class="invalid-feedback"><%= getError('avatar') %></div>
    <% } %>
  </div>

  <!-- Submit buttons -->
  <div class="d-flex justify-content-between">
    <a href="/users" class="btn btn-secondary">Cancel</a>
    <button type="submit" class="btn btn-primary">
      <%= submitText || 'Save' %>
    </button>
  </div>
</form>
```

**2. Helper functions for error handling:**

```typescript
// Create helper functions for templates
@Controller()
export class BaseController {
  protected getTemplateHelpers(errors: any[] = []) {
    const errorMap = new Map();

    // Convert validation errors to field-error map
    errors.forEach((error) => {
      if (error.property) {
        errorMap.set(error.property, Object.values(error.constraints || {})[0]);
      }
    });

    return {
      hasError: (field: string) => errorMap.has(field),
      getError: (field: string) => errorMap.get(field) || '',
      formatDate: (date: Date) => date.toLocaleDateString(),
      truncate: (text: string, length: number = 100) =>
        text.length > length ? text.substring(0, length) + '...' : text,
    };
  }
}
```

### Q: How to create a hybrid API + SSR application?

**A:** Combine API endpoints with server-rendered views:

**1. Hybrid controller structure:**

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // API Endpoints
  @Get('api')
  async getUsers(@Query() query: GetUsersDto) {
    const users = await this.usersService.findAll(query);
    return {
      success: true,
      data: users,
      pagination: users.pagination,
    };
  }

  @Post('api')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      data: user,
      message: 'User created successfully',
    };
  }

  // View Endpoints
  @Get()
  @Render('users/index')
  async getUsersPage(@Query() query: any) {
    const users = await this.usersService.findAll(query);
    return {
      title: 'Users',
      users: users.data,
      pagination: users.pagination,
      currentPath: '/users',
    };
  }

  @Get('new')
  @Render('users/create')
  getCreateUserForm() {
    return {
      title: 'Create User',
      action: '/users',
      submitText: 'Create User',
      formData: {},
      errors: [],
    };
  }

  @Post()
  async handleCreateUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.create(createUserDto);
      res.redirect(`/users/${user.id}?created=true`);
    } catch (error) {
      const helpers = this.getTemplateHelpers(error.response?.message || []);
      res.render('users/create', {
        title: 'Create User',
        action: '/users',
        submitText: 'Create User',
        formData: createUserDto,
        errors: error.response?.message || [],
        ...helpers,
      });
    }
  }
}
```

**2. API versioning with views:**

```typescript
// API routes
@Controller('api/v1/users')
export class UsersApiController {
  // API-only logic
}

// Web routes
@Controller('users')
export class UsersWebController {
  // View rendering logic
}

// Admin routes
@Controller('admin/users')
export class AdminUsersController {
  // Admin interface with views
}
```

### Q: Best practices for static assets and view integration?

**A:** Follow these best practices for optimal performance and maintainability:

**1. Asset organization:**

```
public/
├── css/
│   ├── components/          # Component-specific styles
│   ├── pages/              # Page-specific styles
│   ├── vendor/             # Third-party CSS
│   └── app.css            # Main application styles
├── js/
│   ├── components/         # Reusable JS components
│   ├── pages/             # Page-specific scripts
│   ├── vendor/            # Third-party libraries
│   └── app.js            # Main application script
├── images/
│   ├── icons/             # SVG icons
│   ├── photos/            # Content images
│   └── ui/               # UI elements
└── fonts/                 # Custom fonts
```

**2. Performance optimization:**

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure static assets with caching
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    maxAge: '1d',              // Cache for 1 day
    etag: true,                # Enable ETags
    lastModified: true,        # Enable Last-Modified headers
  });

  // Compress responses
  app.use(compression());

  await app.listen(3000);
}
```

**3. Template organization:**

```
views/
├── layouts/
│   ├── main.ejs           # Default layout
│   ├── admin.ejs          # Admin layout
│   └── auth.ejs           # Authentication layout
├── partials/
│   ├── head.ejs           # HTML head section
│   ├── header.ejs         # Navigation
│   ├── footer.ejs         # Footer
│   ├── sidebar.ejs        # Sidebar component
│   └── pagination.ejs     # Pagination component
├── pages/
│   ├── home.ejs
│   ├── about.ejs
│   └── contact.ejs
└── modules/
    ├── users/
    ├── posts/
    └── admin/
```
