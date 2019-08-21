const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('can see blog create form', async () => {
    const label = await page.getContentOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('And using valid parameters', () => {
    beforeEach(async () => {
      await page.type('.title input', 'my title');
      await page.type('.content input', 'my content');
      await page.click('form button');
    });

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentOf('h5');

      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentOf('.card-title');
      const content = await page.getContentOf('p');

      expect(title).toEqual('my title');
      expect(content).toEqual('my content');
    });
  });

  describe('And using invalid inputs', () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('the form shows an error message', async () => {
      const titleError = await page.getContentOf('.title .red-text');
      const contentError = await page.getContentOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('User is not logged in', () => {
  test('User cannot create blog post', async () => {
    const result = await page.evaluate(() => {
      return fetch('api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'My title', content: 'My content 2' })
      }).then(res => res.json());
    });

    expect(result).toEqual({ error: 'You must log in!' });
  });

  test('User cannot get a list of posts', async () => {
    const result = await page.evaluate(() => {
      return fetch('api/blogs', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());
    });

    expect(result).toEqual({ error: 'You must log in!' });
  });
});
