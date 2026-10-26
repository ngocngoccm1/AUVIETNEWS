# Nghiệm thu — THỜI BÁO VIỆT - ÂU

Ngày kiểm tra: 26/10/2026. Kiểm tra trực tiếp bằng Chromium headless; không mở cửa sổ demo.

- `npm run build`: đạt, gồm TypeScript strict và Vite production build. JavaScript đã tách thành các chunk ứng dụng, React, thư viện và Supabase; không có cảnh báo bundle lớn ở lần build cuối.
- `npm run test:e2e`: **22/22 đạt** trên bản production trong `dist/`.
- Đã xem ảnh chụp toàn trang desktop 1440px và mobile 390px. Kiểm tra tự động không tràn ngang trên các trang chính ở 320, 375, 390, 768, 1024 và 1440px.
- 7 chuyên mục, đủ 34 tiểu mục; menu điện thoại mở tiểu mục và điều hướng đúng.
- Tìm kiếm tiếng Việt không dấu, lọc chuyên mục/tiểu mục, trạng thái không có kết quả.
- Đổi VI/EN/DE giữ bài đang đọc; nội dung và thuộc tính `lang` cập nhật.
- Lưu/bỏ lưu bài, tồn tại sau reload; chia sẻ bằng copy URL hash; cỡ chữ đọc được thay đổi trên điện thoại.
- Newsletter: payload email/locale, xác nhận thành công, lỗi thiếu bảng, email trùng.
- Gửi câu chuyện: kiểm tra payload và xác nhận khi API thành công.
- Bài chính thức: bình luận đọc/ghi, thích/bỏ thích gắn article_id và mã anonymous_id của thiết bị.
- Bài mẫu: có nhãn, không cho ghi likes/comments.
- Thư viện ảnh: mở, kế tiếp, phím mũi tên, Escape; ảnh mẫu tải thành công.
- Video MP4 local dài 18 giây, tải và phát được. Đã xem một khung hình kiểm tra tiếng Việt/branding.
- Trang bài/chuyên mục không tồn tại có điều hướng trở về trang chủ.
- Root `index.html` bằng `dist/index.html`. Tài nguyên HTML dùng đường dẫn tương đối, tồn tại đầy đủ. Đã kiểm tra thực tế cả root và subpath `/dist/`, gồm reload trực tiếp URL hash bài viết.
- `dist/` không có `.env` hoặc khóa riêng tư. Các biến `VITE_` public được nhúng vào bundle đúng thiết kế.

## Giới hạn được xác nhận

API Supabase thật trả về `PGRST205` vì chưa có bảng `public.articles`. Chưa chạy schema/seed trên tài khoản vì quyền anon không có DDL; yêu cầu hiện tại là sinh SQL. Các kiểm thử ghi dữ liệu dùng API mock có kiểm tra payload; không ghi dữ liệu thử vào backend thật. Cần chạy `supabase/schema.sql` trong SQL Editor, sau đó tùy chọn `supabase/seed.sql`.

Chưa upload ảnh lên ImageKit vì public key không cấp quyền upload. Bộ ảnh sẵn ở `public/images/`; thư mục đích là `/AU_VIET_NEWS`. UI đã dùng local fallback, database chỉ chứa URL ImageKit.

Giọng đọc dùng Web Speech API và phụ thuộc giọng cài trên thiết bị; chưa có giọng phù hợp sẽ hiện thông báo. Chưa kiểm tra Safari/iOS trên thiết bị thật. Newsletter hiện lưu người đăng ký; chưa tích hợp dịch vụ gửi email. Chưa publish lên hosting.

## Bổ sung trang đăng bài — 26/10/2026

Đã thêm `/#/vi/admin` và phiên bản giao diện EN/DE; `/#/vi/post` chuyển tới trang soạn bài. Có liên kết trong menu điện thoại và cuối trang.

- Đã xem ảnh chụp trang soạn bài ở desktop 1440px và điện thoại 390px. Kiểm thử cả soạn và xem trước ở 320, 390, 768, 1440px, không tràn ngang.
- 15 kiểm thử riêng cho biên tập: tìm trang và chuyển hướng, slug tiếng Việt/tùy chỉnh, lưu nháp qua reload và xác nhận xóa, nội dung VI/EN/DE, tiêu đề phụ, reset tiểu mục khi đổi chuyên mục, kiểm tra ảnh bìa, chặn khách và tài khoản chưa được cấp quyền, đăng nhập, đăng xuất, báo thiếu schema, xuất bản với JWT, đọc bài được trả về, xử lý slug trùng và hiển thị nội dung văn bản an toàn.
- Kiểm thử xác nhận nút xuất bản đầu tiên chỉ mở bước kiểm tra; chỉ gửi INSERT sau khi người dùng xác nhận. Payload có đúng chuyên mục, tiểu mục, nội dung và `featured`; bản dịch/ảnh bỏ trống gửi `null`.
- `supabase/editor.sql` là migration thêm quyền cho project đã chạy schema cũ. `supabase/schema.sql` cũng đã tích hợp cấu trúc mới. Bảng `editor_accounts` chỉ cho tài khoản đọc dòng quyền của chính mình; không cho client tự thêm quyền. Policy INSERT bài viết yêu cầu `auth.uid()` có trong danh sách biên tập. Không mở quyền sửa/xóa bài.
- Bài mới dùng chú thích ảnh bìa chung; không gán nguồn Unsplash cho ảnh riêng của biên tập viên. Chính sách riêng tư đã bổ sung bản nháp và phiên đăng nhập.

Các luồng đăng nhập/xuất bản được kiểm tra qua API mock; chưa tạo tài khoản, chạy migration hoặc đăng bài thử trên Supabase thật. Cần quản trị viên chạy SQL và cấp tài khoản theo README. Public key không có quyền thực hiện các bước quản trị này. Soạn/xem trước/lưu nháp hoạt động trước khi thiết lập backend.

Bản build cuối sau bổ sung đăng bài: `npm run build` đạt; toàn bộ `npm run test:e2e` **37/37 đạt** (22 kiểm thử website + 15 kiểm thử biên tập). Root `index.html` và `dist/index.html` đã đồng bộ. Localhost 4173 trả HTTP 200 và được giữ chạy để người dùng xem.

## Sửa kết nối lưu trữ thật — 26/10/2026

Trạng thái mới nhất thay thế các giới hạn khởi tạo SQL ở những mục trước:

- Đã kết nối quản trị Supabase, xác nhận project `mbuyxygaxkeocrbwlsuv` (nocprj), database public ban đầu trống.
- Đã áp dụng migration `create_magazine_tables_and_editor_access` lên project thật: đủ 6 bảng, RLS bật cho tất cả. Anon không có quyền INSERT articles; authenticated có grant nhưng vẫn phải qua policy editor_accounts.
- API thật `/rest/v1/articles` trả HTTP 200, `[]`. Kiểm thử INSERT trong transaction rồi ROLLBACK thành công; xác minh không còn bản ghi QA. Chưa xuất bản bài mẫu vào database thật.
- Đã deploy Edge Function `imagekit-upload`, version 1, trạng thái ACTIVE. Kiểm tra live OPTIONS trả 204; POST không đăng nhập trả 401. Function tự kiểm tra Supabase Auth và quyền biên tập trước khi gọi ImageKit.
- Có nút chọn ảnh, gửi multipart kèm JWT đến function, cập nhật cover_image bằng URL trả về; chỉ lúc xuất bản mới lưu URL vào articles. Không dùng base64/localStorage cho ảnh, không dùng Supabase/Firebase Storage.
- Backend ép folder /AU_VIET_NEWS, sinh tên duy nhất, không overwrite, kiểm tra magic bytes của JPEG/PNG/WebP/GIF và giới hạn 8 MB. Khóa riêng chỉ đọc từ server secret. Lỗi upstream không trả nguyên văn dữ liệu nhạy cảm về trình duyệt.
- Đã bổ sung trạng thái kết nối phân biệt database chưa khởi tạo, mất kết nối và database rỗng. Trạng thái upload không tự tuyên bố ảnh đã lưu khi chưa có phản hồi thành công.
- 6 kiểm thử handler chạy logic backend thật với HTTP upstream giả lập: quyền truy cập, ép folder/tên file, không lộ khóa, định dạng/dung lượng, secrets thiếu, CORS và response URL sai.
- 4 kiểm thử UI bổ sung cho upload→URL→publish, giữ ảnh cũ khi lỗi, chặn định dạng không hỗ trợ và trạng thái database.

**Chưa kiểm chứng upload thật đến ImageKit:** chưa có IMAGEKIT_PRIVATE_KEY trong cấu hình được cung cấp. Cần chủ tài khoản đặt khóa vào Supabase Edge Functions Secrets. Project cũng chưa có tài khoản Supabase Auth/biên tập tại thời điểm kiểm tra; cần tạo một tài khoản rồi cấp quyền. Không tạo mật khẩu mặc định, không yêu cầu dán khóa riêng vào chat. Các kiểm thử UI upload vẫn dùng phản hồi ImageKit giả lập; không được xem như bằng chứng ảnh đã lưu trên ImageKit thật.

Bản cuối của thay đổi lưu trữ: build TypeScript/Vite đạt; toàn bộ **47/47 kiểm thử đạt** (22 website, 19 editor, 6 handler upload). Đã xem giao diện mobile với kết nối Supabase thật: hiện trạng thái database sẵn sàng và 0 bài, không tràn ngang. Root index.html đã đồng bộ với dist/index.html. Giới hạn còn lại là kích hoạt ImageKit secret và tạo/cấp quyền tài khoản biên tập; chưa có bằng chứng upload ImageKit thật cho tới khi hoàn thành các bước này.

## Kích hoạt ImageKit với khóa thật — 26/10/2026

- Đã lưu khóa được cung cấp vào Supabase Vault; không lưu trong source, .env Vite hoặc bản build. Migration `imagekit_vault_server_only_lookup` tạo RPC SECURITY INVOKER chỉ cho service_role đọc một secret có tên cố định. Kiểm tra quyền: anon=false, authenticated=false, backend=true; API công khai gọi RPC bị từ chối HTTP 401.
- Đã deploy imagekit-upload version 2, trạng thái ACTIVE; backend đọc environment secret trước, Vault sau. Lookup Vault chỉ xảy ra sau khi xác minh biên tập viên.
- Đã upload 12 JPEG thật vào /AU_VIET_NEWS bằng ImageKit API. Manifest lưu URL trả về từ API, không tự đoán đường dẫn. Ảnh Berlin được kiểm tra CDN HTTP 200. Bộ bài mẫu và seed đã cập nhật các URL thật; Photo ưu tiên ImageKit, fallback local theo manifest.
- Thêm kiểm thử backend về thứ tự xác thực trước khi đọc Vault, và kiểm thử UI về nguồn ImageKit/fallback đúng ảnh. Không cần sửa client key hoặc đưa private key vào website.
- Chưa kiểm thử thao tác upload từ một tài khoản biên tập thật vì tài khoản đăng nhập chưa được cung cấp; các phép upload thực tế dùng API ImageKit với key đã được cấp, kết hợp kiểm thử xác thực/loader của backend.

Kết quả cuối: cả 12 URL ImageKit với transformation `w-900,q-85,f-auto` trả HTTP 200. Trình duyệt thực tế xác nhận ảnh chính trang chủ tải từ ImageKit; mobile 390px không tràn ngang. Build thành công; **49/49 kiểm thử đạt**. Root index.html và dist/index.html đồng bộ. Không có khóa riêng trong các file được commit.
