# angularLoginBackend

## What is it?
It's a service similar to [$httpBackend](https://docs.angularjs.org/api/ngMockE2E/service/$httpBackend).
It should be used to register login requests and responces to use them later (when defining endpoints that should
require user authentication).

This service was designed to work with [angularApiTest](https://github.com/RomanSek/angularApiTest) plugin, but can be
used separately. Parameters that are used only by [angularApiTest](https://github.com/RomanSek/angularApiTest) plugin
will be indicated.

## How it works?
Service should be configured before first usage. After that - login requests should be registered with it. Lastly it
should be used to generate authentication header requests.

### How to configure?
Use `ccLoginBackend.config(requestIdGetter, sessionGetter, responseOverride, sessionFactory)` method:

* `requestIdGetter(method, url, data, headers)` - **Function** It is called on every request registered with
    `ccLoginBackend.when` method. It returns `sessionId` of this request that should be used later to get session
    headers.
* `sessionGetter(status, data, headers, statusText)` - **Function** It is called on every response registered with
    `ccLoginBackend.when` method. It returns session object (e.g. token) retrived from login response used later by
    `sessionFactory` and `responseOverride`.
* `responseOverride(status, data, headers, statusText, session)` - **Function** It's
    [angularApiTest](https://github.com/RomanSek/angularApiTest) plugin specific function that overrides test server
    response using session object retrived with `sessionGetter` from mocked response. It'll be done before responses are
    matched.
* `sessionFactory(session)` - **Function** It's a generator function that uses session object retrived with
    `sessionGetter`. It returns header object that should be used in authenticated requests. It's used by
    `ccLoginBackend.session` method.

#### Example
```javascript
ccLoginBackend.config(
    function(method, url, data, headers) {
        return data.email;
    },
    function(status, data, headers, statusText) {
        return data.token;
    },
    function(status, data, headers, statusText, session) {
        data.token = session;
        return [status, data, headers, statusText];
    },
    function(session) {
        return {
            'Authorization': 'Token ' + session
        };
    }
);
```

### How to register login requests?
Only successful login requests should be registered with `ccLoginBackend.when` unsuccessful requests can be mocked using
[$httpBackend](https://docs.angularjs.org/api/ngMockE2E/service/$httpBackend).

#### Example
```javascript
// Login attempts
ccLoginBackend.when(
    'POST',
    '/api/tokens',
    {
        email: 'test@example.com',
        password: 'secret'
    }
).respond(
    201,
    {
        token: '9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b'
    }
);

$httpBackend.whenPOST(
    '/api/tokens',
    {
        email: 'nonExistingUser@example.com',
        password: 'NOPE'
    }
).respond(
    400,
    {
        non_field_errors: ['Unable to log in with provided credentials.']
    }
);

```

### How to generate authenticated headers?
Any registered login request can be used to generate authenticated headers. It is done using
`ccLoginBackend.session(sessionId)` method. `sessionId` should be the identical to one returned by `requestIdGetter`.

#### Example
```javascript
//Authenticated request
$httpBackend.whenGET(
    '/api/items',
    ccLoginBackend.session('test@test.pl')
).respond(
    200,
    [
        {
            'id': 1,
            'name': 'item 1'
        },
        {
            'id': 2,
            'name': 'item 2'
        }
    ]
);

//Unauthenticated request
$httpBackend.whenGET(
    '/api/items'
).respond(
    400,
    {
        'error': 'This resource requires authentication.'
    }
);
```

## How to install?

```bash
bower install RomanSek/angularLoginBackend --save-dev
```

## How to use in module?
* Include script in index.html:

    ```html
    <script src="bower_components/angularLoginBackend/index.js">
    ```
* Import **ccMockE2E** module:

    ```javascript
    angular.module('angulardashDev',['ngMockE2E', 'ccMockE2E'])
    ```
* Inject in `run`:

    ```javascript
    module.run(['ccLoginBackend', '$httpBackend', function(ccLoginBackend, $httpBackend) {
        ...
    });
    ```
* Use as described in **How it works?** section.

## TODO List
* Make `responseOverride` last (optional) parameter of `ccLoginBackend.config`. Move it's description to
    [angularApiTest](https://github.com/RomanSek/angularApiTest) plugin docs.
* Create unit tests
