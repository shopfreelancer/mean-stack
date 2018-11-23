import {Post} from './post.model';
import {Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], totalPosts: number }>();

  constructor(private http: HttpClient, private router: Router) {
  }

  /**
   * es6 syntax to copy the array (not the elements though)
   */
  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string, posts: any, totalPosts: number }>('http://localhost:3000/api/posts' + queryParams)
      .pipe(map(postData => {
        return {
          posts: postData.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              id: post._id,
              userId: post.userId
            };
          }), totalPosts: postData.totalPosts
        };
      }))
      .subscribe(formatedPostsData => {
        this.posts = formatedPostsData.posts;
        this.postsUpdated.next({posts: [...this.posts], totalPosts: formatedPostsData.totalPosts});
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    // json will not work here due to the uploaded image blob
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http.post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  /**
   * Get one post by i
   * create clone of post object to avoid mutating the store directly
   */
  getPost(id: string) {
    //  return {...this.posts.find( post =>  post.id === id)};
    return this.http.get<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      userId: string
    }>('http://localhost:3000/api/posts/' + id);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        userId: null // mongoose sets this automatically on backend
      };
    }
    this.http.put('http://localhost:3000/api/posts/' + id, postData)
      .subscribe(response => {
        this.router.navigate(['/']);
      });
  }

  deletePost(id: string) {
    return this.http.delete('http://localhost:3000/api/posts/' + id);
  }
}
