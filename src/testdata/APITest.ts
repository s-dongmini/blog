/*
/post
POST
    /{id}
    GET
    DELETE
/comment
GET
    /{key}
    GET
    POST
        /{id}
        DELETE
/page?tag={csv=''}&page={num=1}
GET
/hashmap?sel={csv=''}
GET
 */
import { Comment, CommentGenerator } from './Comment';
import { Post, PostGenerator } from './Post';


const posts = PostGenerator(100);
const comments = CommentGenerator(300, posts);

export function testAPI(query: string, method: string, body: any = {}): any {
    if (query.startsWith('/post')) {
        return post(query.slice(5), method, body);
    } else if (query.startsWith('/comment')) {
        return comment(query.slice(8), method, body);
    } else if (query.startsWith('/page')) {
        return page(query.slice(5), method);
    } else if (query.startsWith('/length')) {
        return length(query.slice(7), method);
    } else if (query.startsWith("/hashmap")) {
        return hashmap(query.slice(8), method);
    } else {
        throw new SyntaxError("Invalid Query in testAPI");
    }
}


function post(query: string, method: string, body: any) {
    switch (method) {
        case "GET":
            for (let p of posts) {
                if (p.id === query.slice(1)) {
                    return p;
                }
            }
            throw new ReferenceError("Does not exist");
        case "POST":
            try {
                const p = {
                    id: Math.random().toString(36).substr(2, 6),
                    datetime: (new Date()).getTime(),
                    hashs: body.hashs,
                    views: 0,
                    title: body.title,
                    content: body.content
                }
                posts.push(p);
                return p;
            } catch {
                throw new TypeError("Invalid body")
            }
        case "DELETE":
            for (let i = 0; i < posts.length; i++) {
                if (posts[i].id === query) {
                    return posts.splice(i, 1)[0];
                }
            }
            throw new ReferenceError("Does not exist");
        default:
            throw new SyntaxError("Invalid method");
    }
}
function comment(query: string, method: string, body: any) {
    switch (method) {
        case "GET":
            if (query.length === 0) {
                return comments;
            }
            let temp: Comment[] = [];
            for (let c of comments) {
                if (c.key === query.slice(1)) {
                    temp.push(c);
                }
            }
            temp.sort((a, b) => b.datetime - a.datetime);
            return temp;
        case "POST":
            try {
                const c = {
                    key: body.key,
                    id: Math.random().toString(36).substr(2, 6),
                    password: body.password,
                    reply: body.reply || '',
                    admin: false,
                    datetime: (new Date()).getTime(),
                    mbti: body.mbti || '',
                    name: body.name || 'anonym',
                    email: body.email || '',
                    ip: body.ip,
                    content: body.content
                }
                comments.push(c);
                return c;
            } catch {
                throw new TypeError("Invalid body")
            }
        case "DELETE":
            for (let i = 0; i < comments.length; i++) {
                if (comments[i].id === query) { //todo
                    return posts.splice(i, 1)[0];
                }
            }
            throw new ReferenceError("Does not exist");
        default:
            throw new SyntaxError("Invalid method");
    }
}
function page(query: string, method: string = 'GET') {
    let tag: string = '';
    let page: number = 1;
    const params = new URLSearchParams(query);
    for (let entry of params.entries()) {
        switch (entry[0]) {
            case 'tag':
                tag = entry[1];
                break;
            case 'page':
                page = parseInt(entry[1]);
                break;
        }
    }

    switch (method) {
        case "GET":
            const pageCount = 10;
            if (tag === '') {
                posts.sort((a, b) => b.datetime - a.datetime);
                return posts.slice((page - 1) * pageCount, page * pageCount);
            } else {
                const tagList: string[] = tag.split(",").map((elem) => elem + ",");
                let result: Post[] = posts.filter((elem) => {
                    let flag = true;
                    for (let t of tagList) {
                        if (!elem.hashs.includes(t)) {
                            flag = false;
                        }
                    }
                    return flag;
                });
                result.sort((a, b) => b.datetime - a.datetime);
                return result.slice((page - 1) * pageCount, page * pageCount);
            }
        default:
            throw new SyntaxError("Invalid method");
    }
}
function length(query: string, method: string = 'GET') {
    if (method !== 'GET') {
        throw new SyntaxError("Invalid method");
    }
    let tag: string = '';
    const params = new URLSearchParams(query);
    for (let entry of params.entries()) {
        if (entry[0] === 'tag') {
            tag = entry[1];
        }
    }
    if (tag === '') {
        return posts.length;
    } else {
        const tagList: string[] = tag.split(",").map((elem) => elem + ",");
        let result: Post[] = posts.filter((elem) => {
            let flag = true;
            for (let t of tagList) {
                if (!elem.hashs.includes(t)) {
                    flag = false;
                }
            }
            return flag;
        });
        return result.length;
    }
}

function hashmap(query: string, method: string = 'GET') {
    if (method !== 'GET') {
        throw new SyntaxError("Invalid method");
    }
    let tag: string = '';
    const params = new URLSearchParams(query);
    for (let entry of params.entries()) {
        if (entry[0] === 'tag') {
            tag = entry[1];
        }
    }
    let count: any = {};
    let hashs: string[] = [];
    if (tag === '') {
        for (let p of posts) {
            hashs = p.hashs.slice(0, -1).split(",");
            for (let h of hashs) {
                count[h] = count[h] + 1 || 1;
            }
        }
    } else {
        const tagList: string[] = tag.split(",").map((elem) => elem + ",");
        for (let p of posts.filter((elem) => {
            let flag = true;
            for (let t of tagList) {
                if (!elem.hashs.includes(t)) {
                    flag = false;
                }
            }
            return flag;
        })) {
            hashs = p.hashs.slice(0, -1).split(",");
            for (let h of hashs) {
                if (!tagList.includes(h + ',')) {
                    count[h] = count[h] + 1 || 1;
                }
            }
        }
    }
    return count;
}
