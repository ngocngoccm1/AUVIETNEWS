# THỜI BÁO VIỆT - ÂU

Tạp chí điện tử Việt – Anh – Đức, ưu tiên tiếng Việt. React 18 + TypeScript + Vite, Tailwind CSS, các thành phần shadcn/ui (Button, Dialog dựa trên Radix), React Router v6 HashRouter, react-i18next, TanStack Query, Supabase và ImageKit.

## Chạy và build

Node.js 22 trở lên.

```bash
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

- `dist/` là **toàn bộ static site**, `dist/index.html` ở gốc. Upload **nội dung** thư mục này lên static host.
- `base: './'` và HashRouter hỗ trợ cả root domain lẫn repo subpath: `/ten-repo/#/vi/article/slug`.
- Sau build, `index.html`, `assets/`, `images/`, `media/`, `favicon.svg` và `.nojekyll` ở gốc cũng được đồng bộ để GitHub Pages nhận trực tiếp khi chọn **Deploy from a branch → main → /(root)**.
- File nguồn HTML được giữ tại `scripts/source-index.html`; Vite plugin sử dụng file này cho dev/build. Không chỉnh file `index.html` đã sinh sau build.
- Có sẵn `.github/workflows/deploy.yml` nếu chọn **Settings → Pages → Source: GitHub Actions**. Workflow dùng public key, không dùng service role/private key.
- Netlify: build `npm run build`, publish `dist`. Cloudflare Pages: tương tự. Không cần SPA redirect vì router dùng hash.

## Cấu hình

`.env` đã chứa cấu hình được cung cấp; `.env.example` để tham khảo. Project ref được chuẩn hóa thành `https://mbuyxygaxkeocrbwlsuv.supabase.co`. Mọi biến `VITE_` được nhúng vào static bundle và công khai theo thiết kế. Không đưa service-role Supabase hoặc ImageKit private key vào đây. Đổi `.env` cần build lại. Trên host build từ Git (ngoài workflow GitHub đã có cấu hình), đặt các biến trong `.env.example` tại mục Environment variables của host.

## Khởi tạo Supabase

Project phản hồi API nhưng tại thời điểm dựng website chưa có bảng `public.articles`.

1. Mở **Supabase Dashboard → SQL Editor**, chạy `supabase/schema.sql`.
2. Tùy chọn chạy `supabase/seed.sql` để nạp **15 bài mẫu** với nội dung VI/EN/DE; không phải tin thời sự đã kiểm chứng.
3. Thêm/chỉnh bài thật qua Table Editor. `category`, `subcategory` dùng slug tại `src/data/categories.ts`. `slug` duy nhất, không dấu. Nội dung hỗ trợ đoạn văn và tiêu đề `##`, hiển thị thành React text để không chèn HTML/script.
4. Xóa bài mẫu (ID bắt đầu `00000000-0000-4000-8000-`) trước khi xuất bản chính thức. Các bài này luôn có nhãn và không mở tương tác, kể cả khi được seed lên database.

Website hiển thị bộ mẫu từ `src/data/articles.json` khi bảng bài viết rỗng hoặc chưa kết nối được. Bài thật được lấy qua Supabase, cache 5 phút, retry 1 lần. Nếu đã có bài thật và backend gián đoạn sau đó, React Query giữ dữ liệu cache. Danh sách hiện lấy tối đa 200 bài gần nhất; lọc/tìm kiếm thực hiện trong bộ dữ liệu này.

Bình luận, thích/bỏ thích, đăng ký bản tin và gửi chuyện dùng API thật. Không giả lập thành công. Không mở bình luận/lượt thích cho bài mẫu. Newsletter hiện lưu email vào Supabase; việc gửi email định kỳ cần nhà cung cấp email hoặc tác vụ backend riêng. Các yêu cầu xóa dữ liệu/hủy nhận tin nhận qua biểu mẫu Liên hệ để ban biên tập xử lý.

**Giới hạn của mô hình likes theo schema yêu cầu:** `anonymous_id` ở localStorage không phải danh tính xác thực. UI chỉ xóa theo ID của thiết bị, nhưng policy DELETE công khai không bảo vệ quyền sở hữu ở cấp database. Khi cần chống giả mạo/chống spam cho website công khai, chuyển sang Supabase Anonymous Auth + `auth.uid()` và rate-limit ở backend. Public insert cũng cần biện pháp chống spam khi triển khai quy mô lớn. Schema hiện giữ mô hình public đã yêu cầu; không cho client sửa/xóa bài hoặc đọc email/câu chuyện gửi về.

## Ảnh ImageKit

Thư mục dashboard đã cung cấp giải mã thành **`/AU_VIET_NEWS`**. Public key không cấp quyền upload/liệt kê media; vì vậy không có thao tác upload tự động và không cần private key trong trình duyệt.

- Đã chuẩn bị 12 ảnh JPEG ở `public/images/` để giao diện hoạt động ngay. Nguồn: Unsplash; xem `public/images/credits.json`.
- Tải các JPEG này lên thư mục `/AU_VIET_NEWS` bằng ImageKit dashboard, giữ nguyên tên file.
- DB chỉ lưu URL ImageKit, ví dụ `https://ik.imagekit.io/noc/AU_VIET_NEWS/berlin.jpg`.
- `src/lib/imagekit.ts` thêm transformation `tr:w-900,q-85,f-auto` trực tiếp. Chỉ nhận ảnh thuộc endpoint cấu hình. Nếu ảnh thật chưa sẵn sàng, UI dùng ảnh minh họa local; bài mẫu dùng local ngay để không sinh hàng loạt 404.
- Public key được cấu hình đúng yêu cầu; URL transformation không cần gửi public key.
- Đổi ảnh bài thật bằng URL ImageKit; không lưu base64, không dùng Supabase Storage.

## Tính năng

- Trang chủ kiểu tạp chí, tiêu điểm, tin quan tâm, chuyên đề xanh, văn hóa, cộng đồng và đầy đủ 7 chuyên mục cùng 34 tiểu mục.
- Trang chuyên mục và bộ lọc tiểu mục; tìm kiếm không phân biệt dấu tiếng Việt, lọc chuyên mục, sắp xếp theo ngày/lượt xem.
- Trang đọc bài, nội dung đa ngôn ngữ (fallback VI có thông báo), chỉnh cỡ chữ, lưu bài trên thiết bị, chia sẻ native/copy link, bình luận và thích qua Supabase.
- Khu đa phương tiện: video montage minh họa local, thư viện ảnh có bàn phím ←/→ và giọng đọc tổng hợp bằng Web Speech API. Giọng Việt/Anh/Đức phụ thuộc giọng được cài trên thiết bị; UI báo khi không có giọng phù hợp. Không tuyên bố là audio do phóng viên thu.
- Biểu mẫu newsletter/gửi chuyện, trang giới thiệu, liên hệ, quyền riêng tư và điều khoản.
- Desktop, tablet, mobile; menu có đầy đủ tiểu mục; dialog focus trap, nhãn biểu mẫu, skip link và reduced motion.

Có trang tạo bài mới tại `/#/vi/admin` với đăng nhập và RLS theo danh sách biên tập. Chưa có chức năng sửa/xóa bài đã xuất bản, upload media từ client hoặc email delivery.

## Kiểm thử

```bash
npx playwright install chromium
npm run test:e2e
```

Kiểm thử frontend dùng Supabase API giả lập có chủ đích để xác minh thao tác ghi và lỗi; không thêm dữ liệu thử vào project của bạn. Báo cáo kiểm thử và ghi chú nghiệm thu ở `QA.md`.

## Trang đăng bài mới

Mở `/#/vi/admin` (hoặc `/#/en/admin`, `/#/de/admin`). Liên kết **Đăng bài** nằm trong menu điện thoại và cuối trang. `/#/vi/post` chuyển tới trang này.

Có thể soạn và xem trước ngay, không cần đăng nhập. Bản nháp lưu **trên trình duyệt của thiết bị** khi bấm Lưu nháp; chưa gửi lên Supabase. Trang hỗ trợ tiêu đề, mô tả, nội dung VI/EN/DE, tiêu đề phụ `##`, chuyên mục/tiểu mục, tác giả, slug tự sinh, ảnh ImageKit và bài nổi bật. Bản tiếng Việt bắt buộc; EN/DE tùy chọn. Ảnh được tải qua ImageKit Dashboard rồi dán URL, không dùng private key trong client.

Để xuất bản thật, quản trị viên thực hiện một lần:

1. Chạy `supabase/schema.sql` nếu chưa khởi tạo database. Schema mới đã có phần phân quyền biên tập. Nếu đã chạy schema cũ, chỉ cần chạy thêm `supabase/editor.sql`.
2. Mở **Supabase → Authentication → Users → Add user → Create new user**, tạo tài khoản email/mật khẩu cho biên tập viên và xác nhận email. Không tạo tài khoản hay mật khẩu mặc định trong mã nguồn.
3. Trong SQL Editor, thay email thật của biên tập viên và chạy:

```sql
insert into public.editor_accounts(user_id)
select id from auth.users where lower(email) = lower('email-bien-tap-cua-ban@example.com')
on conflict (user_id) do nothing;
```

4. Đăng nhập tại trang Đăng bài. Kiểm tra bản xem trước, bấm **Xuất bản bài viết**, xác nhận. Chỉ khi Supabase trả về bài đã lưu, UI mới báo thành công và cung cấp liên kết đọc bài.

RLS kiểm tra `auth.uid()` thuộc bảng `editor_accounts`; đăng nhập thông thường chưa đủ quyền đăng bài. Browser chỉ đọc được quyền của chính tài khoản, không thể tự cấp quyền. Không dùng user metadata làm quyền quản trị. Quyền client UPDATE/DELETE bài viết vẫn đóng; trang này phục vụ **tạo bài mới**, không chỉnh/xóa bài đã xuất bản. Hủy quyền bằng cách xóa user_id tương ứng khỏi `editor_accounts` trong SQL Editor. Phiên đăng nhập được lưu riêng trên thiết bị cho tới khi đăng xuất; nháp không lưu mật khẩu/token.

Để dữ liệu thật hoạt động, cần khởi tạo SQL và tài khoản như trên. Các thao tác này chưa được thực hiện trên project Supabase vì chỉ có public key; không thể cấp quyền bằng public key.
#   A U V I E T N E W S  
 