import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

interface User {
  name: string,
  token: string
  id: number
}

interface LoginPayload {
  id: number,
  email: string,
  password: string
}

function base64ToUtf8(b64: string) {
    const binaryString = atob(b64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

function parseUsername(token: string) {
  const [login, _] = base64ToUtf8(token).split(':');
  return login == null ? "user" : login;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);

  async function login(payload: LoginPayload) {
    console.log('Login payload:', payload);

    await axios.post('/api/login', payload).then(response => {
        const token = response.data.token as string;
        console.log(`Logged in with: ${token}, ${response.data.id}`);

        const loggedUser = {
          name: parseUsername(token),
          token: token,
          id: response.data.id as number
        }
        user.value = loggedUser;

        axios.defaults.headers.common.Authorization = `Basic ${token}`
      });
  }

  async function logout() {
    user.value = null;
  }

  return { user, login, logout }
})
