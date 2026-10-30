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

## Nhận diện logo và giao diện trắng–đen — 26/10/2026

- Đã đọc được cả 2 ảnh đính kèm từ đường dẫn Windows tương ứng trên WSL. Dùng logo địa cầu trong ảnh nền trong suốt; ảnh ghép nhiều phiên bản chỉ dùng tham chiếu. Không thêm số điện thoại/địa chỉ web từ ảnh tham chiếu vào nội dung website.
- Logo gốc giữ trong public/images/logo-viet-au.png, đã upload ImageKit với URL trong src/data/branding.json. Bản tối ưu rộng 256px trả HTTP 200, khoảng 27 KB. Header/footer dùng logo tối ưu và fallback về bản gốc; tab trình duyệt dùng cùng biểu tượng.
- Component Brand dựng tên THỜI BÁO VIỆT - ÂU bằng HTML, giữ đúng dấu gạch ngang và nhãn truy cập. Logo giữ xanh–vàng nguyên bản; nền, chữ và điều khiển dùng trắng, đen, xám. Ảnh bài viết giữ màu tự nhiên.
- Trình duyệt xác nhận background rgb(255,255,255), text và tên báo rgb(23,23,23). Đã xem desktop/mobile; không tràn ngang tại 320, 375, 390, 768, 1024, 1440px.
- npm run build đạt; toàn bộ 49/49 kiểm thử có sẵn đạt. Root index.html và dist/index.html tiếp tục được đồng bộ.

## Tài khoản mặc định, chặn admin và tự tạo đường dẫn — 26/10/2026

- Đã tạo tài khoản Supabase Auth thật qua Auth Admin API, xác nhận email và thêm vào editor_accounts. Username `admin` ánh xạ tới email đăng nhập nội bộ được cấu hình trong client. Mật khẩu sinh ngẫu nhiên, chỉ giao riêng cho chủ dự án; không lưu trong source, tài liệu, biến VITE_ hay bundle.
- Thao tác cấp tài khoản một lần đã được gỡ ngay sau khi hoàn thành. Edge Function imagekit-upload được khôi phục về mã upload trước đó, version 4 với cùng source hash như bản upload dùng Vault. Không còn nhánh cấp tài khoản trong function đang phục vụ.
- Trang Admin tách riêng màn hình đăng nhập, không mount Editor khi chưa đăng nhập, đang kiểm tra quyền hoặc tài khoản không được cấp quyền. Đăng xuất gỡ phần soạn bài ngay. Bản nháp lưu trên thiết bị không hiển thị trước bước xác thực.
- Loại bỏ ô nhập đường dẫn và trạng thái chỉnh tay. URL tự tạo từ tiêu đề tiếng Việt; API tự thêm hậu tố khi trùng, giữ nguyên mã yêu cầu qua retry và nhận lại bài đã lưu khi bị trùng mã yêu cầu. Không còn yêu cầu nhập slug trong xác thực biểu mẫu.
- Đã đăng nhập thật qua Auth API và qua Chromium bằng username admin; xác minh quyền biên tập, endpoint ImageKit sẵn sàng và đăng xuất ẩn Editor. Đã thử INSERT dưới role authenticated của tài khoản thật trong transaction rồi rollback; không để lại bài kiểm tra công khai.
- Kiểm tra trình duyệt: form đăng nhập và soạn bài ở desktop/mobile; mobile 390px không tràn ngang, URL tự sinh nhip-cau-viet-au và không có ô slug để nhập. Không chụp hoặc lưu mật khẩu trong ảnh nghiệm thu.
- TypeScript/Vite build đạt; toàn bộ 50/50 kiểm thử đạt, gồm chặn khách, chờ kiểm tra role, tài khoản chưa được duyệt, alias đăng nhập, phiên đăng nhập sau reload, đăng xuất, đường dẫn tự tạo, retry trùng URL, giữ bản nháp và upload ảnh. Root index.html đồng bộ với dist/index.html.

## Giao diện theo phatgiao.org.vn - 28/10/2026

- Đối chiếu trang mẫu bằng trình duyệt desktop 1440px và mobile 390px, đọc stylesheet công khai. Xác nhận font đọc/tiêu đề là Roboto, màu nhấn #993333, khung nội dung 1220px, tin chính ngang và timeline Tin mới bên phải.
- Audit trước chỉnh: giao diện trắng/đen, Be Vietnam Pro + Lora/Playfair, hero ba cột, các mảng giới thiệu lớn. Giữ logo, nhận diện THỜI BÁO VIỆT - ÂU, 7 chuyên mục/34 tiểu mục, nội dung, các đường dẫn HashRouter và toàn bộ thao tác đọc/đăng bài. Chuyển sang trang báo theo tham chiếu; variance 3, motion 1, density 7. Đây là cảm hứng bố cục, không dùng logo hoặc nội dung của trang mẫu.
- Roboto Variable tự host thông qua Fontsource (OFL); loại bỏ Google Fonts và các font serif cũ. Đồng bộ font cho tiêu đề, nội dung, nút và biểu mẫu. Vite đóng gói font vào assets tương đối, dùng được tại GitHub Pages repo subpath.
- Trang chủ: tin chính ảnh 58% / nội dung 42%, hai tin phụ + góc nhìn, cột tin mới/tin đọc nhiều, chuyên mục và đủ liên kết tiểu mục, multimedia, newsletter. Mobile xếp một cột, cỡ chữ đọc 16-18px và tiêu đề 22-24px, menu/tìm kiếm hai bên logo.
- Kiểm tra viewport 320/375/390/768/1024/1440px, tất cả không tràn ngang. Sửa margin ảnh bài viết để khớp lề mobile 15px. Đã xem ảnh desktop/mobile, khối chuyên mục và newsletter/footer. Font load thực sự và computed font là Roboto Variable.
- Build TypeScript/Vite thành công. 50/50 kiểm thử đạt: chuyên mục/tiểu mục, menu mobile, responsive các trang, chuyển ngôn ngữ, tìm kiếm, đọc bài, đăng nhập/quyền admin, tự tạo slug, upload, newsletter, root/subpath deployment. Bộ test dùng Edge trên Windows và static server Node đa nền tảng.
- Giữ root index.html đồng bộ dist/index.html, không cần server hỗ trợ rewrite. Không thay đổi schema, dữ liệu hoặc tài khoản.

## Nội dung tham chiếu và hoa văn gốc - 30/10/2026

- Rà soát trang phatgiao.org.vn ở desktop/mobile, xác định `patten-1.png` dùng cho khối bài đọc, phần kết nối và footer; `patten-4.png` dùng cho chủ đề. Sao lưu hai ảnh vào src/assets, ghi URL nguồn trong src/data/reference-credits.json. Đối chiếu trực tiếp các khối Hỏi đáp và footer nguồn.
- Dùng hoa văn gốc tại dải chủ đề, banner nhịp cầu, Sống an vui, Hỏi đáp, khối kết nối màu vàng, bài liên quan và footer đỏ #993333. Giữ nền nhạt sau chữ đen, chữ trắng trên chân trang đỏ; logo và tên THỜI BÁO VIỆT - ÂU tiếp tục hiện riêng. Không nhập danh tính, giấy phép, thông tin quyên góp hoặc script của trang tham chiếu.
- Biên soạn 8 bản lược thuật ngắn dựa trên bài nguồn có thật, kèm tiêu đề, ảnh và nút mở bài gốc. EN/DE có tiêu đề/mô tả, nội dung dài dùng cơ chế fallback tiếng Việt có thông báo. Trang nguồn có thông báo hoan nghênh sao chép tại footer; vẫn giữ provenance cho từng bài và ảnh.
- Đã upload thật 8 ảnh qua Supabase Edge Function imagekit-upload bằng tài khoản biên tập; tất cả URL trả về thuộc ImageKit /AU_VIET_NEWS. Bản sao tương ứng nằm ở public/images/reference-*.jpg; kiểm tra helper dự phòng vẫn khớp đúng ảnh khi CDN lỗi.
- Đã lưu thật 8 bài trong Supabase bằng REST dưới phiên biên tập, xác minh GET trả đủ 8 record với cover_image ImageKit. Không ghi đè bài đã có slug. Seed khôi phục riêng ở supabase/reference-seed.sql, lưu nguồn ngay trong content_vi. Frontend ghép metadata nguồn theo slug mà giữ nội dung database làm nguồn chính. Không đưa password/token/private key vào source hay bundle.
- Build TypeScript/Vite đạt; root index.html giống dist/index.html, hoa văn được đóng gói thành assets hash và URL tương đối. 54/54 kiểm thử đạt, gồm các kiểm thử hiện có và kiểm tra mới về nền tải thật, trang lược thuật/nguồn gốc, metadata từ bài live và ảnh dự phòng.
- Responsive các route đạt ở 320/375/390/768/1024/1440px; kiểm thử hoa văn và đọc bài ở 320/390/1440px, không tràn ngang. Đã xem ảnh chụp desktop và mobile cho đầu trang, khối Sống an vui, Hỏi đáp, kết nối và footer.
