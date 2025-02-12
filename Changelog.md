# Changelog

## Short summary of changes

This project has evolved from a simple Next.js chat application into a more sophisticated system with user authentication, database integration, and comprehensive testing. The development journey started with basic message functionality and progressively added features like user management, PostgreSQL database integration, JWT authentication, and extensive end-to-end testing capabilities.

Key milestones include the transition from a simple messaging system to a full-fledged chat application with user sessions, the introduction of proper database migrations, and the implementation of both API and UI-level testing frameworks. The project maintains comprehensive documentation with proper markdown formatting and version tracking.

## Version history

### v0.14
**Goal**: Update UI to use v2 channel and messages API

Updating the UI to support channels while keeping the existing architecture:
1. Split main screen into channels list and messages panel
2. Add channel creation and join functionality
3. Implement channel message viewing and sending
4. Support channel management (add user, leave channel)
5. Enable deep linking to specific channels
6. Keep existing authentication UI and mechanisms

Note: Existing UI tests are preserved for now and will be updated in a separate change.

### v0.13
**Goal**: Introduce API level tests for channels and messages

Let's introduce an API level test for the new APIs. Have a look at the e2e/api/users.test.sv for the best practices, but keep it intact, create another test for V2 APIs. 

Have a look at the API and previous few records in Changelog, and suggest a happy path flow for two users, where one would create a few types of channels and another would join public and be added to private, also both sending messages. 

Start the test with comment enumerating steps, and then implement the steps. Use clear user names/emails, channel names with reference to API tests

### v0.12
**Goal**: Introduce channels and messages v2

Added support for channels and a new message system with improved scalability:
1. Introduced channels with public/private visibility
2. Added channel membership system
3. Created new message structure with separate preview and content storage
4. Implemented message storage with headers (metadata + preview) and contents (full text) tables
5. Added new v2 API endpoints for channels and messages
6. Kept original message API for backward compatibility

Key technical decisions:
- Message content is split into preview and full content tables for performance
- Channel codes are auto-generated 6-character unique identifiers
- All operations maintain data consistency using transactions
- Message headers table uses simple UUID primary key for better compatibility
- Indexes support efficient channel and user-based message queries

@Codebase It's time to introduce channels and messages, which will be posted to the channels by the authenticated users.
In this change we need to introduce DB structure changes and APIs, leaving UI for a later stage.

Channel can be created by any authenticated user who becomes the owner.
Channels require a region id (just DEFAULT for now), a title, an optional description and a private/public flag
Each channel has a uuid, an auto-generated 6 chars channel code, state (ACTIVE/DELETED), a creation date and the owner, and also a preview of the last message (up to 128 chars)

Users can be members of multiple channel with a role, which by now can only be USER

Messages can be added by the users to the channels. Message content is now a text up to 64k, and we need two similar structures at DB level: one for efficiency only keeps first up to 128 chars of the message, and another one with full message content.
Messages have uuid, channel id, user id, created date, deleted flag, kind (TEXT for now), content (as described above).

Users will be able to create channels, post messages to the channels they are a member of, add themselves to a channel by ID o

Leave the current messages API as is, introduce an /api/v2/. Think as a senior engineer, considering volumes of data (e.g. should messages structures be partitioned by date and so on.)

Follow contributing guidelines.

### v0.11
**Goal**: Improve changelog formatting and documentation

There's a draft of Changelog.md. It contains empty summary and all prompts for all changes we've done so far under v0.x headers:
1) format it as .md file
2) add a summary, 1-2 paragraphs
3) add a statement to Contributing.md which would require to:
   a) add the first prompt of each change request as a version
   b) update Short summary of changes considering it

### v0.10
**Goal**: Make API and UI tests less destructive

Let's make API and UI tests a bit less destructive.
Tests now truncate or delete users table (and messages). Let's change that to deleting the user used by the text pack.
E.g. introduce APItest and UItest users with appropriate emails and replace truncate/delete with deleting of that user (and messages of that user beforehand, if necessary)
When doing that, leave a comment that we should not truncate/delete whole table so you would not forget in future.

There are a few config files in e2e folder;
make a comment in the beginning of each one if that is relevant for API or UI tests

### v0.9
**Goal**: Change backend-frontend authentication to use JWT token

Let's change backend-frontend authentication to use JWT token.
For simplicity the current backend needs to issue the tokens and then check those, levelraging the private/public key system.

Private/public keys should be parameterised so could be overriden per environment. Make a section in Readme explaining how that works.

Let's deprecate the ability to send messages non-authenticated and requite authentication at the API level.

Keep UI as is for now.

Put a special attention to the api tests and end2end tests : those need to be changed in a way so those would continue working.

Follow contributing guidelines. @CONTRIBUTING.md
@codebase

### v0.8
**Goal**: Implement session management and authentication UI

Let's implement a notion of session and Log In / Sign up functions in the app.

in UI, add a horisontal bar at the top
if authenticated - print a nice message which highlights the username, and logout button
if not authenticated - Log in and Sign up buttons
At this stage, not authenticated users can send messages as before.

Log in is an modal window with username and password, and obvious logic incl error handling; username can be either nickname or email. No Forgot password at this point

Sign up asks for the fields which make sense to create a user and does error handling. No email verification is needed.

When messages are received, Message accepted ... response should contain the user's nickname - find a nice wording
The same for Received message in console output.

Follow the contributing guidelines @codebase

### v0.7
**Goal**: Introduce end-to-end tests with real postgres integration

@codebase How could we introduce a few end2end tests, considering the way application is built?

For that, we would run the application with some real postgres (instead of mocking PG responses)

Two kind of tests

browser click through
API level calls

### v0.6
**Goal**: Enhance user authentication logic

Let's change the logic.

User registration should make sure both email and username do not exist
Make authenticate smarter, so that a user could use either username or email

Work across all codebase and follow Contributing Guidelines

### v0.5
**Goal**: Convert migration scripts and improve DB documentation

Convert migration scripts from typescript to SQL format

and then another prompt:

What would be the best way to document current DB tables for AI systems to use? Preferably in SQL-like format.
I've experienced that AI did not want to derive it from migration scripts, so let's explore an option when that's documented.

Then add statements to contributing guidelines,

making it mandatory to review existing data structures when doing any change;
avoid changing it unless confirmed with reviewer;
mandatory keeping the DB tables documentation up to date.

### v0.4
**Goal**: Introduce Postgres DB and user management

We need to introduce Postgres DB in the application, as an application in cloud would do.

Besides connectivity itself we need a way to apply DDL updates and do DB migrations.
Assume Postgres is running locally from a docker, introduce a property file for connection properties.
3.Create a simple table for users in the DB with the following columns:

user id uuid
user nickname
user email
user password
Create an API to register a new user, validate what's necessary for format and uniqness and generate uuid on creations.

Create an API to authenticate user which will be used by the frontend app at the next step.

Create an API to get user information by uuid

To validate DB migration scripts work, introduce a change which would add a creationdate column to users, which should be filled by the current date by default.

Respect Contributing Guidelines in #Contributing.md

### v0.3
**Goal**: Improve message response formatting

The way I see responses in the browser is
Message accepted, length:16 at date:20250203 214011 UTC

I don't like how "at date" sounds, please fix the language.
Spaces after : would improve readability
Also date requires dashes, and time requires colons

Work across project to fix that, respect Contributing guidelines

### v0.2
**Goal**: Add non-functional requirements and testing infrastructure

Let's cover our app with non-functional requirements.
Introduce a contributors file. Add there that

all API calls should be covered with one or more test
all API calls should be documented in OpenAPI
on any change it's mandatory to make sure existing tests&docs have been updated, and the new items are covered
on any change it's mandatory to review whole project and make sure, that the changes introduced would not break the existing features
Readme file must be kept up to date
Then suggest a solution for testing the APIs in NextJS native way
and a tool for documenting APIs
Add those tools to the project

Enumerate all APIs, document them and cover with at least one test - depending on the API complexity.

Update readme with chapters how to run tests locally, how to update OpenAPI documentation and how to open it from the browser.

### v0.1
**Goal**: Create basic Next.JS + React chat application

Let's make this a simple Next.JS + react app

The app should serve a web page like a whatsapp or similar chat: messages of the user aligned to right, responses to the user aligned to left.
There's an add message field at the bottom and "send" button.
On send, the message is both added into web page as sent, and also sent to backend via REST API.
Backend should log the message to system out and send back "Message accepted, length:number of charactes at date:system date in YYYYMMDD HHMMSS TZ format
Backend's response is added to the browser page as a response message.

There's no storage of messages /persistence at this point.

Use M.UI for visuals.
The app is available as a docker image, so for now we should add a docker file.

Update readme with the info above and information how to run the app locally
