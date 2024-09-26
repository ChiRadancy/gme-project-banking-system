# gme-project-banking-system
GME project: A simple banking system with no real world application.

## System specifications:
- System allows for users and user accounts
- A user can have as many accounts as they want
- A user can create and delete accounts
- A user can deposit and withdraw from accounts
- An account cannot have less than 100z at any time in an account.
- A user cannot withdraw more than 90% of their total balance from an account in a single transaction.
- A user cannot deposit more than 10,000z in a single transaction.

**Notes:**
- A GUI is optional, focus on creating a Web API with an emphasis on  coding style, organization, testability and test coverage.
- Connecting to a real database is optional; feel free to fake it with in-memory data structures.
- Utilise the public repository GitHub as a repository

### Project decisions
These are rules and decisions that are either not specified by or are slight changes to the specification.

- Currency will be in fictional "Zeny" - denoted with "z" at the end of the currency value, i.e. 100z.

## Additional features:
The following features could be implemented after the bare minimum has been completed.

In no particular order:
- User login
- Balance transfers
- Closing account options:
  - Withdraw balance
  - Transfer balance
- Add database
- Add User functionality
  - Create User
  - Delete User

## Resources:
Server application code based on: [typescript nodejs tutorial](https://dev.to/wizdomtek/typescript-express-building-robust-apis-with-nodejs-1fln).

Chrome extensions:
  - [Talend API Tester - Free Edition](https://chromewebstore.google.com/detail/talend-api-tester-free-ed/aejoelaoggembcahagimdiliamlcdmfm)