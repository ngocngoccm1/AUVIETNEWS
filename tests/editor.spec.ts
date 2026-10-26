import {test,expect,type Page} from '@playwright/test';
const user={id:'aaaaaaaa-1234-4123-8123-123456789012',email:'editor@example.com',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email',providers:['email']},user_metadata:{},created_at:'2026-10-26T00:00:00Z'};
const token=[{alg:'HS256',typ:'JWT'},{sub:user.id,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600,iat:Math.floor(Date.now()/1000)},'signature'].map((v,i)=>i===2?v:Buffer.from(JSON.stringify(v)).toString('base64url')).join('.');
async function base(page:Page){
 await page.route('**/functions/v1/imagekit-upload',r=>r.fulfill({status:503,json:{code:'imagekit_setup_required'}}));
 await page.route('**/rest/v1/articles?*',r=>r.request().method()==='GET'?r.fulfill({json:[]}):r.fallback());
}
async function auth(page:Page,allowed=true){
 await page.route('**/auth/v1/token?grant_type=password',r=>r.fulfill({json:{access_token:token,refresh_token:'test-refresh-token',expires_in:3600,token_type:'bearer',user}}));
 await page.route('**/auth/v1/logout*',r=>r.fulfill({status:204,body:''}));
 await page.route('**/rest/v1/editor_accounts?*',r=>r.fulfill({json:allowed?{user_id:user.id}:null}));
}
async function login(page:Page,name=user.email){
 await page.getByLabel('Tài khoản hoặc email').fill(name);
 await page.getByLabel('Mật khẩu',{exact:true}).fill('test-password-only');
 await page.getByRole('button',{name:'Đăng nhập biên tập',exact:true}).click();
}
async function openEditor(page:Page){await base(page);await auth(page);await page.goto('/#/vi/admin');await login(page);await expect(page.locator('.editor-approved')).toBeVisible();}
async function write(page:Page,title='Kết nối những câu chuyện Việt – Âu'){
 await page.getByLabel('Tiêu đề bài viết').fill(title);
 await page.getByLabel('Mô tả ngắn').fill('Một hành trình kết nối cộng đồng người Việt và bạn bè châu Âu.');
 await page.getByLabel('Nội dung bài viết',{exact:false}).fill('Một câu chuyện từ đời sống, nơi những con người cùng học cách lắng nghe và sẻ chia.\n\n## Những kết nối gần gũi\nĐây là đoạn nội dung trong bài viết của biên tập viên.');
}
async function confirmPublish(page:Page){await page.getByRole('button',{name:'Xuất bản bài viết',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Xuất bản bài viết',exact:true}).click();}
for(const width of [320,390,768,1440]){
 test(`login and editor stay responsive at ${width}px`,async({page})=>{
  await base(page);await auth(page);await page.setViewportSize({width,height:844});await page.goto('/#/vi/admin');
  await expect(page.getByLabel('Tài khoản hoặc email')).toBeVisible();await expect(page.locator('.editor-form')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await login(page);await write(page);
  for(const action of ['Soạn bài','Xem trước']){await page.locator('.editor-view-tabs').getByRole('button',{name:action,exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
  await expect(page.locator('.editor-preview>h2')).toContainText('Kết nối những câu chuyện');
 });
}
test('guest cannot see editor, saved draft or upload controls',async({page})=>{
 await base(page);await page.addInitScript(()=>localStorage.setItem('viet-au-article-draft-v1',JSON.stringify({title_vi:'Bản nháp riêng tư',content_vi:'Nội dung chưa được xuất bản.'})));
 await page.goto('/#/vi/admin');await expect(page.locator('.admin-login-card')).toBeVisible();await expect(page.locator('.editor-form')).toHaveCount(0);await expect(page.locator('textarea')).toHaveCount(0);await expect(page.locator('.editor-upload-button')).toHaveCount(0);await expect(page.getByText('Bản nháp riêng tư',{exact:true})).toHaveCount(0);
 await page.goto('/#/vi/post');await expect(page).toHaveURL(/vi\/admin/);await expect(page.locator('.admin-login-card')).toBeVisible();
});
test('admin alias maps to configured Auth email and logout closes the editor',async({page})=>{
 await base(page);await auth(page);let email='';await page.route('**/auth/v1/token?grant_type=password',r=>{email=r.request().postDataJSON().email;return r.fulfill({json:{access_token:token,refresh_token:'test-refresh-token',expires_in:3600,token_type:'bearer',user}});});
 await page.goto('/#/vi/admin');await login(page,'admin');await expect(page.locator('.editor-approved')).toBeVisible();expect(email).toBe('admin@thoibaovietau.local');
 await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await expect(page.locator('.admin-login-card')).toBeVisible();await expect(page.locator('.editor-form')).toHaveCount(0);await page.reload();await expect(page.locator('.admin-login-card')).toBeVisible();
});
test('editor stays hidden while role check is pending and for unapproved users',async({page})=>{
 await base(page);await auth(page,false);let release!:()=>void;const pause=new Promise<void>(resolve=>release=resolve);
 await page.route('**/rest/v1/editor_accounts?*',async r=>{await pause;await r.fulfill({json:null});});await page.goto('/#/vi/admin');await login(page);
 await expect(page.getByRole('status')).toContainText('Đang kiểm tra');await expect(page.locator('.editor-form')).toHaveCount(0);release();
 await expect(page.getByRole('alert')).toContainText('chưa được cấp quyền');await expect(page.locator('textarea')).toHaveCount(0);
});
test('slug is automatically generated and updated without an editable input',async({page})=>{
 await openEditor(page);await page.getByLabel('Tiêu đề bài viết').fill('Nhịp cầu Việt – Âu: Điều tử tế');await expect(page.locator('.editor-url-preview')).toContainText('nhip-cau-viet-au-dieu-tu-te');await expect(page.locator('#editor-slug')).toHaveCount(0);
 await page.getByLabel('Tiêu đề bài viết').fill('Tiêu đề đã thay đổi');await expect(page.locator('.editor-url-preview')).toContainText('tieu-de-da-thay-doi');
});
test('draft survives refresh and clearing requires confirmation',async({page})=>{
 await openEditor(page);await write(page);await page.getByRole('button',{name:'Lưu nháp trên thiết bị',exact:true}).click();await expect(page.getByRole('status')).toContainText('Đã lưu');expect(await page.evaluate(()=>localStorage.getItem('viet-au-article-draft-v1'))).not.toContain('access_token');
 await page.reload();await expect(page.getByLabel('Tiêu đề bài viết')).toHaveValue('Kết nối những câu chuyện Việt – Âu');await page.getByRole('button',{name:'Xóa bản nháp',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Tiếp tục chỉnh sửa'}).click();await expect(page.getByLabel('Tiêu đề bài viết')).not.toBeEmpty();
 await page.getByRole('button',{name:'Xóa bản nháp',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Xóa bản nháp',exact:true}).click();await expect(page.getByLabel('Tiêu đề bài viết')).toBeEmpty();
});
test('language content, heading toolbar and dependent subsections',async({page})=>{
 await openEditor(page);await write(page);await page.locator('.editor-language-tabs').getByRole('button',{name:'English',exact:true}).click();await page.getByLabel('Tiêu đề bài viết').fill('A bridge across cultures');await page.getByLabel('Nội dung bài viết',{exact:false}).fill('English article content for readers in Europe and Vietnam.');await page.getByRole('button',{name:'Thêm tiêu đề phụ'}).click();await expect(page.getByLabel('Nội dung bài viết',{exact:false})).toHaveValue(/## /);
 await page.locator('.editor-language-tabs').getByRole('button',{name:'Tiếng Việt',exact:true}).click();await expect(page.getByLabel('Tiêu đề bài viết')).toHaveValue('Kết nối những câu chuyện Việt – Âu');await page.getByLabel('Chuyên mục',{exact:false}).selectOption('kinh-te');await page.getByLabel('Tiểu mục',{exact:true}).selectOption('evfta');await page.getByLabel('Chuyên mục',{exact:false}).selectOption('van-hoa');await expect(page.getByLabel('Tiểu mục',{exact:true})).toHaveValue('');
});
test('required content and invalid cover cannot publish',async({page})=>{
 await openEditor(page);await page.getByRole('button',{name:'Xuất bản bài viết',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Bắt buộc');await write(page);await page.getByLabel('Ảnh bìa ImageKit',{exact:true}).fill('https://untrusted.example/image.jpg');await page.getByRole('button',{name:'Xuất bản bài viết',exact:true}).click();await expect(page.getByRole('alert')).toContainText('endpoint ImageKit');await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('authorized publisher sends JWT, generated URL and correct category',async({page})=>{
 await base(page);await auth(page);let payload:any;let authorization='';let count=0;let row:any=null;
 await page.route('**/rest/v1/articles?*',r=>{if(r.request().method()!=='POST')return r.fulfill({json:row?[row]:[]});count++;payload=r.request().postDataJSON();authorization=r.request().headers().authorization;row={...payload,published_at:new Date().toISOString(),views:0};return r.fulfill({json:row});});
 await page.goto('/#/vi/admin');await login(page);await write(page);await page.getByLabel('Chuyên mục',{exact:false}).selectOption('kinh-te');await page.getByLabel('Tiểu mục',{exact:true}).selectOption('evfta');await page.getByLabel('Đưa vào bài nổi bật').check();
 await page.getByRole('button',{name:'Xuất bản bài viết',exact:true}).click();expect(count).toBe(0);await page.getByRole('dialog').getByRole('button',{name:'Xuất bản bài viết',exact:true}).click();await expect(page.locator('.editor-success')).toBeVisible();expect(count).toBe(1);expect(authorization).toBe(`Bearer ${token}`);expect(payload.slug).toBe('ket-noi-nhung-cau-chuyen-viet-au');expect(payload.category).toBe('kinh-te');expect(payload.subcategory).toBe('evfta');expect(payload.featured).toBe(true);expect(payload.content_en).toBeNull();await page.getByRole('link',{name:'Đọc bài vừa đăng'}).click();await expect(page.locator('.article-header h1')).toContainText('Kết nối những câu chuyện');
});
test('duplicate slug is resolved automatically and retains the publication request ID',async({page})=>{
 await base(page);await auth(page);const payloads:any[]=[];
 await page.route('**/rest/v1/articles?*',r=>{if(r.request().method()!=='POST')return r.fulfill({json:[]});const payload=r.request().postDataJSON();payloads.push(payload);return payloads.length===1?r.fulfill({status:409,json:{code:'23505',message:'duplicate slug'}}):r.fulfill({json:{...payload,published_at:new Date().toISOString(),views:0}});});
 await page.goto('/#/vi/admin');await login(page);await write(page);await confirmPublish(page);await expect(page.locator('.editor-success')).toBeVisible();expect(payloads).toHaveLength(2);expect(payloads[0].slug).toBe('ket-noi-nhung-cau-chuyen-viet-au');expect(payloads[1].slug).toMatch(/^ket-noi-nhung-cau-chuyen-viet-au-[a-f0-9]{8}$/);expect(payloads[0].id).toBe(payloads[1].id);
});
test('failed collision retries keep the draft and allow another attempt',async({page})=>{
 await base(page);await auth(page);await page.route('**/rest/v1/articles?*',r=>r.request().method()==='POST'?r.fulfill({status:409,json:{code:'23505',message:'duplicate'}}):r.fallback());await page.goto('/#/vi/admin');await login(page);await write(page);await confirmPublish(page);await expect(page.getByRole('alert')).toContainText('Chưa tạo được đường dẫn duy nhất');await expect(page.getByLabel('Tiêu đề bài viết')).toHaveValue('Kết nối những câu chuyện Việt – Âu');
});
test('invalid password and missing role schema never reveal the editor',async({page})=>{
 await base(page);await page.route('**/auth/v1/token?grant_type=password',r=>r.fulfill({status:400,json:{code:'invalid_credentials',msg:'Invalid login credentials'}}));await page.goto('/#/vi/admin');await login(page);await expect(page.getByRole('alert')).toContainText('Email hoặc mật khẩu');await expect(page.locator('.editor-form')).toHaveCount(0);
 await auth(page);await page.route('**/rest/v1/editor_accounts?*',r=>r.fulfill({status:404,json:{code:'PGRST205',message:'missing table'}}));await login(page);await expect(page.getByRole('alert')).toContainText('Chưa khởi tạo');await expect(page.locator('.editor-form')).toHaveCount(0);await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await expect(page.getByLabel('Tài khoản hoặc email')).toBeVisible();
});
test('password visibility is optional and admin login is translated',async({page})=>{
 await base(page);await page.goto('/#/vi/admin');await expect(page.getByLabel('Mật khẩu',{exact:true})).toHaveAttribute('type','password');await page.getByRole('button',{name:'Hiện mật khẩu'}).click();await expect(page.getByLabel('Mật khẩu',{exact:true})).toHaveAttribute('type','text');await page.getByRole('button',{name:'Ẩn mật khẩu'}).click();await page.locator('.languages').getByRole('button',{name:'Deutsch'}).click();await expect(page.getByLabel('Benutzername oder E-Mail')).toBeVisible();await expect(page.locator('.editor-form')).toHaveCount(0);
});
test('preview renders article content as safe text',async({page})=>{
 await openEditor(page);await page.getByLabel('Tiêu đề bài viết').fill('<img src=x onerror=alert(1)>');await page.getByLabel('Nội dung bài viết',{exact:false}).fill('<script>alert(1)</script>\n\n## Tiêu đề an toàn\nNội dung văn bản.');await page.locator('.editor-view-tabs').getByRole('button',{name:'Xem trước',exact:true}).click();await expect(page.locator('.editor-preview>h2')).toContainText('<img');await expect(page.locator('.editor-preview script')).toHaveCount(0);
});
test('image upload uses editor JWT and fills the returned URL',async({page})=>{
 await base(page);await auth(page);const url='https://ik.imagekit.io/noc/AU_VIET_NEWS/uploaded-cover.jpg';let uploaded=false;
 await page.route('**/functions/v1/imagekit-upload',r=>{if(r.request().method()==='GET')return r.fulfill({json:{configured:true,folder:'/AU_VIET_NEWS'}});expect(r.request().headers().authorization).toBe(`Bearer ${token}`);expect(r.request().postData()).toContain('filename="berlin.jpg"');uploaded=true;return r.fulfill({json:{url,fileId:'stored',folder:'/AU_VIET_NEWS'}});});await page.goto('/#/vi/admin');await login(page);await expect(page.locator('.editor-connections')).toContainText('Endpoint upload đã sẵn sàng');await page.locator('input[type=file]').setInputFiles('public/images/berlin.jpg');await expect(page.getByLabel('Ảnh bìa ImageKit',{exact:true})).toHaveValue(url);await expect(page.locator('.editor-upload-success')).toContainText('đã được lưu');expect(uploaded).toBe(true);
});
test('missing upload configuration preserves the previous cover',async({page})=>{
 await openEditor(page);await page.getByLabel('Ảnh bìa ImageKit',{exact:true}).fill('https://ik.imagekit.io/noc/AU_VIET_NEWS/original.jpg');await page.locator('input[type=file]').setInputFiles('public/images/berlin.jpg');await expect(page.getByRole('alert')).toContainText('IMAGEKIT_PRIVATE_KEY');await expect(page.getByLabel('Ảnh bìa ImageKit',{exact:true})).toHaveValue('https://ik.imagekit.io/noc/AU_VIET_NEWS/original.jpg');await expect(page.locator('.editor-upload-success')).toHaveCount(0);
});
test('unsupported file is rejected before reaching the upload endpoint',async({page})=>{
 await base(page);await auth(page);let writes=0;await page.route('**/functions/v1/imagekit-upload',r=>{if(r.request().method()==='POST')writes++;return r.fulfill({json:{configured:true}});});await page.goto('/#/vi/admin');await login(page);await page.locator('input[type=file]').setInputFiles({name:'unsafe.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg></svg>')});await expect(page.getByRole('alert')).toContainText('Chỉ nhận ảnh');expect(writes).toBe(0);
});
