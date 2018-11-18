import {Component, OnInit } from '@angular/core';
import { ParamMap } from '@angular/router';
import {NgForm} from '@angular/forms';
import {PostsService} from '../posts.service';
import {ActivatedRoute} from '@angular/router';
import { Post } from '../post.model';
@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit {
  private mode: string = 'create';
  private id: string;
  public post: Post;

  constructor(public postsService: PostsService, public route: ActivatedRoute) {}

  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if(this.mode === 'edit'){
      this.postsService.updatePost(this.id, form.value.title, form.value.content);
    } else {
      this.postsService.addPost(form.value.title, form.value.content);
    }

    form.resetForm();
  }

  ngOnInit(){
     this.route.paramMap.subscribe((paramMap: ParamMap) => {
       if(paramMap.has('id')){
          this.mode = 'edit';
          this.id = paramMap.get('id');
          this.postsService.getPost(this.id).subscribe(postData => {
            this.post = {
              id: postData._id,
              title: postData.title,
              content: postData.content
            };
          });
       } else {
         this.mode = 'create';
         this.id = null;
       }
     });
  }
}
