import {Component, OnInit} from '@angular/core';
import {ParamMap} from '@angular/router';
import {NgForm} from '@angular/forms';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {PostsService} from '../posts.service';
import {ActivatedRoute} from '@angular/router';
import {Post} from '../post.model';
import {mimeType} from './mime-type.validator';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})

export class PostCreateComponent implements OnInit {
  private mode = 'create';
  private id: string;
  public post: Post;
  public isLoading = false;
  public form: FormGroup;
  public imagePreview: string;

  constructor(public postsService: PostsService, public route: ActivatedRoute, private sanitizer: DomSanitizer) {
  }

  onSavePost(form: NgForm) {
    if (this.form.invalid) {
      return;
    }
    if (this.mode === 'edit') {
      this.postsService.updatePost(
        this.id,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }

    this.form.reset();
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  ngOnInit() {
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, {
        validators: [Validators.required]
      }),
      'image': new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id')) {
        this.mode = 'edit';
        this.id = paramMap.get('id');
        this.isLoading = true;
        this.postsService.getPost(this.id).subscribe(postData => {
          this.isLoading = false;
          this.imagePreview =  postData.imagePath;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
          });
        });
      } else {
        this.mode = 'create';
        this.id = null;
      }
    });
  }
}
