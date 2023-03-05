/**
  *
  * main() will be invoked when you Run This Action
  *
  * @param OpenWhisk actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(inp_params_digital_locker) {

    console.log("Input params>>>" + JSON.stringify(inp_params_digital_locker));
    var clientId = inp_params_digital_locker.clientId;
    console.log("clientId>>>>" + clientId);

    switch (clientId) {
        case 'dbae6898-29c6-4992-9df7-587cb557a8e4':
            return {
                "sysDetails": {
                    "party_name": "Acme Ltd",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/acme-ltd",
                    "client_secret": "K0vY8dO8dF2sC0jM1rS5nG7xR4qS0iE7gC3cA4yE3kJ4sV4sS8"
                }
            }
            break;
        case 'cfc853a0-0f33-44f6-a98d-1d6fe1bdff84':
            return {
                "sysDetails": {
                    "party_name": "Barnsley Landlord Services",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/barnsley-landlord-services",
                    "client_secret": "rE4rE2jY5kC2mG4gG4cJ5gU2dR8gI7bK4vH6hW2eA0mC3aC1jS"
                }
            }
            break;
        case 'd3985084-e5a4-4a53-b18f-a820ef282370':
            return {
                "sysDetails": {
                    "party_name": "Property Management PLC",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/property-management-plc",
                    "client_secret": "kU0jG1jN2fN5xH1fX3cI0bP0bH8nB4eC1bD5oL5cE5cU7mM5oQ"
                }
            }
            break;
        case '6229209e-4ca1-4d72-a5a4-2ef323bd256b':
            return {
                "sysDetails": {
                    "party_name": "Rigsby Landlords",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/rigsby-landlords",
                    "client_secret": "D5xN4nW2cM0aV4wK3iF0fR2eW1cT2mM7tW0wW8xK4qR5sO0oI7"
                }
            }
            break;
        case '880c322c-754e-4406-9339-1b34c7e3830a':
            return {
                "sysDetails": {
                    "party_name": "Jermaine Claims Management",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/jermaine-claims-management",
                    "client_secret": "H4oN0jL7aU3iV4nL1jU1mG1vV2aQ3vX5bK3gU0nS5vI1cE6iH8"
                }
            }
            break;
        case '5aacb2cf-20d7-40dd-a05e-63a3160fb02e':
            return {
                "sysDetails": {
                    "party_name": "Jackie Underwriters",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/jackie-underwriters",
                    "client_secret": "mL0aS4eI3rR3bC0pA1eW7pS7xV2gL1mO5pN6kY6oV3jK5vQ1rN"
                }
            }
            break;
        case '9bda79d5-8c56-4f15-abb3-74670c7e1f46':
            return {
                "sysDetails": {
                    "party_name": "Marlon Brokers",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/marlon-brokers",
                    "client_secret": "fY2kY1mS5lB5vI3vR7mG8jI7rR7nG6qY7cQ3nL7sH4gJ2tV0gA"
                }
            }
            break;
        case '8b5c4424-08a1-4970-b65e-f178482de7cb':
            return {
                "sysDetails": {
                    "party_name": "MJ Insurance Services",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/mj-insurance-services",
                    "client_secret": "dN0fF7dG0wB4aW4wW0pI6bP7tS6lH8sX0nO2tT6jR4cF4wQ5vF"
                }
            }
            break;
        case '35685197-4c99-401a-a2c2-056b3dadcedf':
            return {
                "sysDetails": {
                    "party_name": "Tito Managing Agency",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/tito-managing-agency",
                    "client_secret": "hP3yD4mB0yM1oF6uA6tN2wA7iE7pB1qE3kL3aL0jL4bU5pP4qD"
                }
            }
            break;
        case '0eb07e8f-67b4-4eb0-9e76-e4abb05652b9':
            return {
                "sysDetails": {
                    "party_name": "TestLandlord",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/testlandlord",
                    "client_secret": "P7cQ3pV4iL7hG4gO3qN4lM8pU4sN3gM6aR3kA8sH0pM5vV7vS0"
                }
            }
            break;
        case '41c12b6b-de79-48d1-8507-8fb7bad84b45':
            return {
                "sysDetails": {
                    "party_name": "TestLandlordAgent",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/testlandlordagent",
                    "client_secret": "R0fN8eF7wU1pH3lH8kF2qT6xS7dG4mQ2qV1tK7wD6oM4dC8sF5"
                }
            }
            break;
        case 'd9bef04a-06a5-4f6b-839b-a46e67eac910':
            return {
                "sysDetails": {
                    "party_name": "TestTenant",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/testtenant",
                    "client_secret": "iB8mM1wJ8vU0hM6tR2cP6oK0pI5lA3nQ1cJ7iK1lS6tB3nL1hL"
                }
            }
            break;
        case '7cba8f9c-5ce8-498c-b988-aee67d0bad18':
            return {
                "sysDetails": {
                    "party_name": "TestPropertyManager",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/testpropertymanager",
                    "client_secret": "K5eK6gX0dG8eE5qN8bK2kH5oG7eF6lI4iO4tF6nQ1nN6rU8oT7"
                }
            }
            break;
		case '539f5f6d-fbf0-45b8-9942-abe08b6c52cd':
            return {
                "sysDetails": {
                    "party_name": "Stagecoach",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/stagecoach",
                    "client_secret": "eP8jM5tD6nC1hH3fP0oM6cA1qT0rB5yG3lO4lL6fY0qG0uE3aF"
                }
            }
            break;
		case '610e41e3-be34-4778-8a65-6399fe8991c6':
            return {
                "sysDetails": {
                    "party_name": "MerseyLink",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/merseylink",
                    "client_secret": "rB7hL4lC0cT1aD4eA8uA3lS5jN2yD2rF0qX6pO1qI5yG2hL7fI"
                }
            }
            break;
		case 'bd26f52e-bb34-4912-b362-c7902b8c5d8d':
            return {
                "sysDetails": {
                    "party_name": "TransPennine",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/transpennine",
                    "client_secret": "J1lB7jE6mY1hJ4gU3dK7pI8aU3wL5oG3oS0sG5qJ8fE7yM1wE0"
                }
            }
            break;
		case '63c72dd9-c248-4978-9ab1-490d8878201b':
            return {
                "sysDetails": {
                    "party_name": "ABBOTT",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/abbott",
                    "client_secret": "kB0sX3wU5aU6nA6jE5iW8mX6aX8yC4aQ5qA5eH8dD2oW3tD8yF"
                }
            }
            break;
		case '99f4f201-35d8-4000-a0b1-ae81f51ca7e6':
            return {
                "sysDetails": {
                    "party_name": "LENNON",
                    "api_endpoint": "https://api.eu.apiconnect.ibmcloud.com/dxc-digital-innovation-platform-dip-service-catalogue/prod/lennon",
                    "client_secret": "X0lF4bH4aY6lT8pM5aF5uV0aE8jQ4vJ7wW1hD2mK0xA0qY3fK7"
                }
            }
            break;

    }
}
exports.main = main;