import {Post} from './post.model';
import {Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  /**
   * es6 syntax to copy the array (not the elements though)
   */
  getPosts() {
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
      .pipe(map((postData) => {
        return postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
          };
        });
      }))
      .subscribe((formatedPosts) => {
        this.posts = formatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = {id: null, title: title, content: content};
    this.http.post<{message: string, id: string}>('http://localhost:3000/api/posts', post)
      .subscribe((responseData) => {
        const id = responseData.id;
        post.id = id;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  /**
   * Get one post by id
   * create clone of post object to avoid mutating the store directly
   * @param id
   */
  getPost(id: string){
    //  return {...this.posts.find( post =>  post.id === id)};
    return this.http.get<{_id: string, title: string, content: string}>('http://localhost:3000/api/posts/' + id);
  }

  updatePost(id: string, title: string, content: string){
    const post: Post = {id: id, title: title, content: content};
    this.http.put('http://localhost:3000/api/posts/'+id, post)
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(id: string) {
    this.http.delete('http://localhost:3000/api/posts/' + id)
      .subscribe((responseData) => {
        const updatedPosts = this.posts.filter(post => post.id !== id);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
