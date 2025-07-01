// keycloakService.js
import axios from 'axios';

const keycloakBaseUrl = 'http://localhost:9080'; // Replace with your Keycloak host
const realm = 'RuleMasterAI'; // Replace with your realm name
const clientId = 'admin-cli'; // or your custom client
const username = 'admin'; // admin username
const password = 'admin'; // admin password

// Get Keycloak Admin Token
async function getAccessToken() {
  try {
    const response = await axios.post(
      `${keycloakBaseUrl}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        username,
        password,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error.response?.data || error.message);
    throw new Error('Unable to fetch Keycloak access token');
  }
}

// Create a new user in Keycloak
async function createUser(userData) {
  try {
    const token = await getAccessToken();

    const payload = {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      enabled: true
    };

    const response = await axios.post(
      `${keycloakBaseUrl}/admin/realms/${realm}/users`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating user:', error.response?.data || error.message);
    throw error;
  }
}

//get all users
async function getAllUsers() {
   try {
    const token = await getAccessToken();
    const pageSize = 100;
    let allUsers = [];
    let first = 0;

    while (true) {
      const response = await axios.get(
        `${keycloakBaseUrl}/admin/realms/${realm}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            first,
            max: pageSize,
          },
        }
      );

      const users = response.data;
      allUsers.push(...users);

      if (users.length < pageSize) {
        break;
      }

      first += pageSize;
    }

    return allUsers;
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    throw new Error('Failed to fetch users from Keycloak');
  }
}

//Delete user
async function deleteUser(userId) {
  try {
    const token = await getAccessToken();

    await axios.delete(
      `${keycloakBaseUrl}/admin/realms/${realm}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { message: 'User deleted successfully' };
  } catch (error) {
    console.error('Delete user error:', error.response?.data || error.message);
    throw new Error('Failed to delete user');
  }
}


// Export functions
export { getAccessToken, createUser , getAllUsers, deleteUser};
