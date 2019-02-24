// var axios = require('axios')
const http_client = require('https');
const development = true;

class ViewBasedClient {
  constructor(options) {
    this.token = options.token || '';
    this.app_id = options.app_id || '';
    this.auth_pair = (options.auth_view && options.auth_scene) ? { scene: options.auth_scene, view: options.auth_view } : '';
  }

  async _request_async(options) {

    return new Promise((resolve, reject) => {

      const request = http_client.request(options, (response) => {

        if (!response || !response.on) {

          return reject();
        }

        let document_text = "";

        response.on('data', (chunk) => {

          document_text += chunk;
        });

        response.on('end', () => {
          let body;
          try {
            body = JSON.parse(document_text)
          } catch (error) {
            body = JSON.stringify(document_text)
          }
          resolve({ statusCode: response.statusCode, body });
        });
      });

      request.on('error', reject);

      if (options.data) {

        request.write(JSON.stringify(options.data));
      }

      request.end();
    });
  }

  request(options) {
    let request_options =  {
      path: `/v1/${options.url}`,
      host: 'api.knack.com',
      method: options.method,
      headers: {'X-Knack-Application-Id': this.app_id, 'content-type': 'application/json'},
      data: options.data
    }

    if (this.token) request_options.headers['Authorization'] = this.token;

    return this._request_async(request_options).then(res => res, error => error)
  }

  auth(email, password) {
    if (!email && !password) {
      return Error('You must provide an email and password');
    }

    if(!this.app_id) {
      return Error('The application ID for your Knack app is required to make this request')
    }

    const options = {
      url: `applications/${this.app_id}/session`,
      method: 'POST',
      data: {
        email,
        password
      }
    }

    // make request
    return this.request(options).then((res) => {

      if (res.statusCode === 200) {
        this.setToken(res.body.session.user.token);

        return {
          isAuth: true,
          token: res.body.session.user.token,
          response: res
        }
      }

      return {
        isAuth: false,
        response: res
      }
    }).catch((error) => {

      return {
        isAuth: false,
        response: error
      };
    })
  }

  isAuthenticated(token = this.token) {

    if (!this.app_id) return Error('No application ID found')
    if (!this.auth_pair) return Error('No auth pair given during configuration, refer to docs for Creating Knack AUTH_ENDPOINT')

    const options = {
      url: `pages/${this.auth_pair.scene}/views/${this.auth_pair.view}/records`,
      method: 'GET'
    }

    return this.request(options).then((res) => {

      if (res.statusCode === 200)  {
        return { isAuth: true, response: res };
      }

      return { isAuth: false, response: res }
    }).catch((error) => {

      return {
        isAuth: false,
        error
      }
    })
  }

  setToken(token) {
    if (!token) return;
    this.token = token
  }
}

console.log('hello')

module.exports = {
  ViewBasedClient
};
