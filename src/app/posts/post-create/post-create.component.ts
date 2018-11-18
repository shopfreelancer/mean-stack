import {Component, OnInit } from '@angular/core';
import { ParamMap } from '@angular/router';
import {NgForm} from '@angular/forms';
import {FormGroup, FormControl, Validators} from '@angular/forms';
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
  public isLoading = false;
  public form: FormGroup;

  constructor(public postsService: PostsService, public route: ActivatedRoute) {}

  onSavePost(form: NgForm) {
    if (this.form.invalid) {
      return;
    }
    if(this.mode === 'edit'){
      this.postsService.updatePost(this.id, this.form.value.title, this.form.value.content);
    } else {
      this.postsService.addPost(this.form.value.title, this.form.value.content);
    }

    this.form.reset();
  }

  ngOnInit(){
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, {
        validators: [Validators.required]
      })
    });
     this.route.paramMap.subscribe((paramMap: ParamMap) => {
       if(paramMap.has('id')){
          this.mode = 'edit';
          this.id = paramMap.get('id');
          this.isLoading = true;
          this.postsService.getPost(this.id).subscribe(postData => {
            this.isLoading = false;
            this.post = {
              id: postData._id,
              title: postData.title,
              content: postData.content
            };
            this.form.setValue({
              'title': this.post.title,
              'content': this.post.content
            });
          });
       } else {
         this.mode = 'create';
         this.id = null;
       }
     });
  }
}
