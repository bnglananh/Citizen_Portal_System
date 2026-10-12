package com.citizenportal.backend.config;

import com.citizenportal.backend.chatbot.entity.ChatbotSetting;
import com.citizenportal.backend.chatbot.repository.ChatbotSettingRepository;
import com.citizenportal.backend.chatbot.service.ChatbotService;
import com.citizenportal.backend.faq.entity.Faq;
import com.citizenportal.backend.faq.repository.FaqRepository;
import com.citizenportal.backend.procedure.entity.Procedure;
import com.citizenportal.backend.procedure.entity.ProcedureCategory;
import com.citizenportal.backend.procedure.entity.ProcedureRequiredDocument;
import com.citizenportal.backend.procedure.repository.ProcedureCategoryRepository;
import com.citizenportal.backend.procedure.repository.ProcedureRepository;
import com.citizenportal.backend.procedure.repository.ProcedureRequiredDocumentRepository;
import com.citizenportal.backend.user.entity.Role;
import com.citizenportal.backend.user.entity.RoleType;
import com.citizenportal.backend.user.entity.User;
import com.citizenportal.backend.user.repository.RoleRepository;
import com.citizenportal.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ProcedureCategoryRepository categoryRepository;
    private final ProcedureRepository procedureRepository;
    private final ProcedureRequiredDocumentRepository documentRepository;
    private final FaqRepository faqRepository;
    private final ChatbotSettingRepository chatbotSettingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initRoles();
        initUsers();
        initProcedures();
        initFaqs();
        initChatbotSettings();
        log.info("=== Khởi tạo dữ liệu hệ thống hoàn tất! ===");
    }

    private void initRoles() {
        for (RoleType roleType : RoleType.values()) {
            if (roleRepository.findByName(roleType).isEmpty()) {
                Role role = Role.builder()
                        .name(roleType)
                        .description(roleType == RoleType.ROLE_ADMIN ? "Quản trị viên toàn hệ thống"
                                : roleType == RoleType.ROLE_STAFF ? "Cán bộ xử lý nghiệp vụ" : "Người dân / Công dân")
                        .build();
                roleRepository.save(role);
            }
        }
    }

    private void initUsers() {
        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN).orElseThrow();
        Role staffRole = roleRepository.findByName(RoleType.ROLE_STAFF).orElseThrow();

        // 1. Admin (Quản trị viên & có quyền Cán bộ)
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Quản Trị Viên Hệ Thống")
                    .email("admin@dichvucong.gov.vn")
                    .phoneNumber("0901234567")
                    .identityCardNumber("001099000001")
                    .address("Ủy ban nhân dân Phường Tân Phú")
                    .active(true)
                    .roles(new HashSet<>(Arrays.asList(adminRole, staffRole)))
                    .build();
            userRepository.save(admin);
            log.info("Khởi tạo tài khoản Quản trị viên: admin / admin123");
        }

        // 2. Staff (Cán bộ xử lý hồ sơ: staff & staff_001)
        if (userRepository.findByUsername("staff").isEmpty()) {
            User staff = User.builder()
                    .username("staff")
                    .password(passwordEncoder.encode("Staff@123"))
                    .fullName("Nguyễn Thị Mai (Cán Bộ Tiếp Nhận)")
                    .email("staff@dichvucong.gov.vn")
                    .phoneNumber("0908765432")
                    .identityCardNumber("001099000002")
                    .address("Bộ phận Một cửa - UBND Phường Tân Phú")
                    .active(true)
                    .roles(new HashSet<>(Collections.singletonList(staffRole)))
                    .build();
            userRepository.save(staff);
            log.info("Khởi tạo tài khoản Cán bộ: staff / Staff@123");
        }

        if (userRepository.findByUsername("staff_001").isEmpty()) {
            User staff001 = User.builder()
                    .username("staff_001")
                    .password(passwordEncoder.encode("Staff@123"))
                    .fullName("Nguyễn Thị Mai (Cán Bộ Tiếp Nhận)")
                    .email("canbo@dichvucong.gov.vn")
                    .phoneNumber("0908765432")
                    .identityCardNumber("001099000003")
                    .address("Bộ phận Một cửa - UBND Phường Tân Phú")
                    .active(true)
                    .roles(new HashSet<>(Collections.singletonList(staffRole)))
                    .build();
            userRepository.save(staff001);
            log.info("Khởi tạo tài khoản Cán bộ: staff_001 / Staff@123");
        }
    }

    private void initProcedures() {
        // 1. Categories
        ProcedureCategory hoTich = getOrCreateCategory("HO_TICH", "Hộ tịch & Tư pháp", "Các thủ tục đăng ký khai sinh, kết hôn, khai tử, trích lục và xác nhận tình trạng hôn nhân", "user");
        ProcedureCategory datDai = getOrCreateCategory("DAT_DAI", "Đất đai & Môi trường", "Các thủ tục đăng ký biến động, cấp đổi sổ đỏ, xác nhận hiện trạng sử dụng đất", "home");
        ProcedureCategory xayDung = getOrCreateCategory("XAY_DUNG", "Xây dựng & Đô thị", "Thủ tục cấp phép xây dựng nhà ở riêng lẻ, sửa chữa, cải tạo công trình đô thị", "build");
        ProcedureCategory laoDong = getOrCreateCategory("LAO_DONG", "Lao động - TB & Xã hội", "Thủ tục cấp đổi thẻ BHYT, trợ cấp xã hội, xác nhận đối tượng chính sách", "team");
        ProcedureCategory chungThuc = getOrCreateCategory("CHUNG_THUC", "Chứng thực & Sao y", "Chứng thực bản sao từ bản chính, chứng thực chữ ký, chứng thực hợp đồng giao dịch", "file-done");
        ProcedureCategory kinhDoanh = getOrCreateCategory("KINH_DOANH", "Hộ kinh doanh cá thể", "Đăng ký thành lập mới, thay đổi nội dung đăng ký, tạm ngừng kinh doanh hộ cá thể", "shop");

        // =========================================================================
        // 1. LĨNH VỰC HỘ TỊCH & TƯ PHÁP (HO_TICH)
        // =========================================================================
        // 1.1. Khai sinh
        createOrUpdateProcedure(
                "TTHC_KHAISINH_01",
                "Đăng ký khai sinh",
                "Thủ tục đăng ký khai sinh cho trẻ em sinh ra tại Việt Nam có cha mẹ là công dân Việt Nam.",
                hoTich, 1, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Điền tờ khai trực tuyến hoặc nộp bản quét tờ khai có chữ ký\nBước 2: Cán bộ tiếp nhận và kiểm tra hồ sơ giấy chứng sinh\nBước 3: Cấp trích lục khai sinh điện tử và số định danh cá nhân",
                "Trẻ em được sinh ra trong lãnh thổ Việt Nam có cha hoặc mẹ là công dân Việt Nam.",
                "Luật Hộ tịch số 60/2014/QH13; Nghị định 123/2015/NĐ-CP",
                Arrays.asList(
                        createDocDef("Tờ khai đăng ký khai sinh", "Điền trực tuyến hoặc bản quét rõ nét có chữ ký (.pdf)", true, 1),
                        createDocDef("Giấy chứng sinh", "Bản quét hoặc ảnh chụp rõ nét (.pdf, .jpg, .png)", true, 2),
                        createDocDef("CCCD/Căn cước của cha hoặc mẹ", "Quét/chụp mặt trước và mặt sau (.pdf, .jpg, .png)", true, 3),
                        createDocDef("Giấy tờ chứng minh nơi cư trú", "Cung cấp khi cơ quan không tra cứu được dữ liệu (.pdf, .jpg, .png)", false, 4)
                )
        );

        // 1.2. Kết hôn
        createOrUpdateProcedure(
                "TTHC_KETHON_01",
                "Đăng ký kết hôn",
                "Thủ tục đăng ký kết hôn giữa hai công dân Việt Nam cư trú tại địa phương.",
                hoTich, 1, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp tờ khai và hồ sơ trực tuyến\nBước 2: Công chức Tư pháp kiểm tra điều kiện kết hôn\nBước 3: Hai bên nam nữ ký Giấy chứng nhận kết hôn tại UBND",
                "Nam từ đủ 20 tuổi, nữ từ đủ 18 tuổi; tự nguyện; không mất năng lực hành vi dân sự.",
                "Luật Hôn nhân và Gia đình số 52/2014/QH13; Luật Hộ tịch 2014",
                Arrays.asList(
                        createDocDef("Tờ khai đăng ký kết hôn", "Điền trực tuyến hoặc upload bản đã ký (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của hai bên nam, nữ", "Scan/chụp rõ 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy xác nhận tình trạng hôn nhân", "Trường hợp cư trú khác phường/xã (.pdf, .jpg, .png)", false, 3),
                        createDocDef("Giấy tờ chứng minh chấm dứt hôn nhân cũ", "Bản án/Quyết định ly hôn hoặc Giấy chứng tử (nếu có) (.pdf, .jpg, .png)", false, 4)
                )
        );

        // 1.3. Khai tử
        createOrUpdateProcedure(
                "TTHC_KHAITU_01",
                "Đăng ký khai tử",
                "Thủ tục đăng ký khai tử cho người qua đời tại địa phương.",
                hoTich, 1, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp hồ sơ và Giấy báo tử trực tuyến\nBước 2: Cán bộ hộ tịch đối chiếu và ghi sổ hộ tịch\nBước 3: Trả Trích lục khai tử",
                "Người đã mất có sự kiện chết xảy ra trên địa bàn hoặc có nơi cư trú cuối cùng tại địa phương.",
                "Luật Hộ tịch số 60/2014/QH13",
                Arrays.asList(
                        createDocDef("Tờ khai đăng ký khai tử", "Điền trực tuyến hoặc bản nộp có chữ ký (.pdf)", true, 1),
                        createDocDef("Giấy báo tử", "Do cơ sở y tế cấp hoặc văn bản thay thế Giấy báo tử (.pdf, .jpg, .png)", true, 2),
                        createDocDef("CCCD/Căn cước của người đi đăng ký", "Scan/chụp mặt trước và mặt sau (.pdf, .jpg, .png)", true, 3),
                        createDocDef("Giấy tờ liên quan đến người đã mất", "CCCD hoặc giấy tờ tùy thân người mất nếu có (.pdf, .jpg, .png)", false, 4)
                )
        );

        // 1.4. Trích lục hộ tịch
        createOrUpdateProcedure(
                "TTHC_TRICHLUC_01",
                "Cấp bản sao/trích lục hộ tịch",
                "Thủ tục cấp bản sao trích lục khai sinh, trích lục kết hôn, trích lục khai tử từ Cơ sở dữ liệu hộ tịch.",
                hoTich, 1, new BigDecimal("8000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp tờ khai trích lục hộ tịch trực tuyến\nBước 2: Cán bộ tra cứu cơ sở dữ liệu hộ tịch điện tử\nBước 3: Xuất bản sao trích lục điện tử hoặc bản giấy",
                "Cá nhân có yêu cầu cấp bản sao trích lục hộ tịch của mình hoặc người có quyền theo quy định.",
                "Nghị định 123/2015/NĐ-CP; Thông tư 04/2020/TT-BTP",
                Arrays.asList(
                        createDocDef("Tờ khai cấp bản sao/trích lục hộ tịch", "Kèm thông tin họ tên, ngày sinh, nơi đăng ký (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của người yêu cầu", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy ủy quyền thực hiện thủ tục", "Bắt buộc nếu ủy quyền cho người khác thực hiện thay (.pdf)", false, 3)
                )
        );

        // 1.5. Tình trạng hôn nhân
        createOrUpdateProcedure(
                "TTHC_HONNHAN_01",
                "Cấp Giấy xác nhận tình trạng hôn nhân",
                "Thủ tục cấp giấy xác nhận tình trạng độc thân để làm thủ tục kết hôn hoặc giao dịch dân sự, nhà đất.",
                hoTich, 3, new BigDecimal("15000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp đơn và hồ sơ trực tuyến\nBước 2: Cán bộ thẩm tra cơ sở dữ liệu hộ tịch\nBước 3: Cấp Giấy xác nhận tình trạng hôn nhân",
                "Công dân Việt Nam thường trú hoặc tạm trú tại địa phương.",
                "Thông tư 04/2020/TT-BTP của Bộ Tư pháp",
                Arrays.asList(
                        createDocDef("Tờ khai cấp Giấy xác nhận tình trạng hôn nhân", "Điền theo mẫu quy định (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của người yêu cầu", "Scan/chụp rõ nét 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy tờ chứng minh tình trạng hôn nhân cũ", "Bản án ly hôn hoặc Giấy chứng tử của vợ/chồng cũ nếu đã từng kết hôn (.pdf, .jpg, .png)", false, 3)
                )
        );

        // =========================================================================
        // 2. LĨNH VỰC ĐẤT ĐAI & MÔI TRƯỜNG (DAT_DAI)
        // =========================================================================
        // 2.1. Đăng ký biến động đất đai
        createOrUpdateProcedure(
                "TTHC_BIENDONGDAT_01",
                "Đăng ký biến động đất đai",
                "Thủ tục đăng ký biến động quyền sử dụng đất trong các trường hợp chuyển nhượng, tặng cho, thừa kế hoặc thay đổi thông tin.",
                datDai, 10, new BigDecimal("28000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp hồ sơ đăng ký biến động trực tuyến\nBước 2: Chi nhánh VP Đăng ký đất đai kiểm tra thực địa & nghĩa vụ tài chính\nBước 3: Xác nhận biến động vào Giấy chứng nhận",
                "Có Giấy chứng nhận hợp pháp, đất không có tranh chấp và trong thời hạn sử dụng đất.",
                "Luật Đất đai số 31/2024/QH15; Nghị định 101/2024/NĐ-CP",
                Arrays.asList(
                        createDocDef("Đơn đăng ký biến động đất đai, tài sản gắn liền với đất", "Điền theo mẫu Mẫu số 11/ĐK (.pdf)", true, 1),
                        createDocDef("Giấy chứng nhận quyền sử dụng đất (Sổ đỏ/sổ hồng)", "Bản scan hoặc ảnh chụp đầy đủ các trang (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Hợp đồng/văn bản chuyển quyền sử dụng đất", "Hợp đồng chuyển nhượng, tặng cho, thừa kế đã công chứng (.pdf)", true, 3),
                        createDocDef("CCCD/Căn cước của người thực hiện thủ tục", "Bản scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 4),
                        createDocDef("Giấy ủy quyền thực hiện thủ tục", "Văn bản ủy quyền hợp pháp nếu nộp qua người đại diện (.pdf)", false, 5)
                )
        );

        // 2.2. Cấp đổi Sổ đỏ
        createOrUpdateProcedure(
                "TTHC_CAPDOISODO_01",
                "Cấp đổi Giấy chứng nhận quyền sử dụng đất",
                "Cấp đổi Giấy chứng nhận do bị ố, nhòe, rách, hư hỏng hoặc do đo đạc lại bản đồ địa chính.",
                datDai, 7, new BigDecimal("50000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp đơn đề nghị cấp đổi trực tuyến\nBước 2: Nộp bản gốc Giấy chứng nhận cũ\nBước 3: Nhận Giấy chứng nhận mới theo mẫu thống nhất",
                "Người sử dụng đất có nhu cầu cấp đổi Giấy chứng nhận đã được cấp.",
                "Luật Đất đai 2024; Nghị định 101/2024/NĐ-CP",
                Arrays.asList(
                        createDocDef("Đơn đề nghị cấp đổi Giấy chứng nhận", "Đơn theo mẫu quy định (.pdf)", true, 1),
                        createDocDef("Bản gốc Giấy chứng nhận quyền sử dụng đất", "Bản quét các trang để đối chiếu (.pdf, .jpg, .png)", true, 2),
                        createDocDef("CCCD/Căn cước của chủ sử dụng đất", "Scan/chụp rõ 2 mặt (.pdf, .jpg, .png)", true, 3),
                        createDocDef("Giấy tờ liên quan đến thay đổi thông tin", "Giấy tờ chứng minh thay đổi số CCCD, địa chỉ nếu có (.pdf, .jpg, .png)", false, 4)
                )
        );

        // 2.3. Xác nhận hiện trạng đất
        createOrUpdateProcedure(
                "TTHC_HIENTRANGDAT_01",
                "Xác nhận hiện trạng sử dụng đất",
                "Thủ tục xác nhận hiện trạng ranh giới, diện tích, mục đích và tình trạng tranh chấp thửa đất tại địa phương.",
                datDai, 5, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp đơn đề nghị xác nhận hiện trạng\nBước 2: Cán bộ Địa chính kiểm tra hồ sơ và khảo sát thực địa\nBước 3: UBND cấp Giấy xác nhận hiện trạng",
                "Thửa đất thuộc địa giới hành chính của phường/xã.",
                "Luật Đất đai số 31/2024/QH15",
                Arrays.asList(
                        createDocDef("Đơn đề nghị xác nhận hiện trạng sử dụng đất", "Đơn trình bày rõ mục đích yêu cầu (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của người yêu cầu", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy chứng nhận quyền sử dụng đất", "Bản sao nếu đã được cấp Giấy chứng nhận (.pdf, .jpg, .png)", false, 3),
                        createDocDef("Sơ đồ/bản vẽ hiện trạng khu đất", "Bản vẽ trích lục sơ đồ thửa đất (.pdf)", false, 4)
                )
        );

        // 2.4. Cấp Sổ đỏ lần đầu
        createOrUpdateProcedure(
                "TTHC_CAPLANDAUDAT_01",
                "Đăng ký cấp Giấy chứng nhận quyền sử dụng đất lần đầu",
                "Thủ tục đăng ký, cấp Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất lần đầu cho hộ gia đình, cá nhân.",
                datDai, 30, new BigDecimal("100000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp hồ sơ đăng ký cấp Giấy chứng nhận lần đầu\nBước 2: UBND phường công khai hiện trạng, niêm phong nguồn gốc đất\nBước 3: Chi nhánh VP ĐKĐĐ thẩm định & trao Giấy chứng nhận",
                "Đất sử dụng ổn định, có một trong các loại giấy tờ quy định tại Điều 137 Luật Đất đai 2024 hoặc đủ điều kiện công nhận.",
                "Luật Đất đai số 31/2024/QH15; Nghị định 101/2024/NĐ-CP",
                Arrays.asList(
                        createDocDef("Đơn đăng ký đất đai, tài sản gắn liền với đất", "Mẫu số 04a/ĐK theo quy định (.pdf)", true, 1),
                        createDocDef("Giấy tờ chứng minh quyền sử dụng đất", "Các giấy tờ về nguồn gốc, quá trình sử dụng đất trước đây (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Sơ đồ nhà ở/công trình gắn liền với đất", "Bản vẽ hoàn công hoặc sơ đồ hiện trạng công trình (.pdf)", false, 3),
                        createDocDef("CCCD/Căn cước của người nộp hồ sơ", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 4)
                )
        );

        // 2.5. Tách thửa / hợp thửa
        createOrUpdateProcedure(
                "TTHC_TACHTHUA_01",
                "Đăng ký tách thửa/hợp thửa đất",
                "Thủ tục tách một thửa đất thành nhiều thửa hoặc hợp nhiều thửa đất liền kề thành một thửa theo nhu cầu sử dụng.",
                datDai, 15, new BigDecimal("50000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp đơn đề nghị tách/hợp thửa kèm bản vẽ\nBước 2: Cơ quan thẩm định kiểm tra điều kiện diện tích tối thiểu\nBước 3: Cấp các Giấy chứng nhận mới tương ứng",
                "Thửa đất đáp ứng đủ điều kiện về diện tích, kích thước cạnh tối thiểu theo Quyết định của UBND cấp tỉnh.",
                "Luật Đất đai 2024; Nghị định 101/2024/NĐ-CP",
                Arrays.asList(
                        createDocDef("Đơn đề nghị tách thửa/hợp thửa đất", "Đơn theo mẫu Mẫu số 11/ĐK (.pdf)", true, 1),
                        createDocDef("Bản gốc Giấy chứng nhận quyền sử dụng đất", "Scan/chụp các trang Giấy chứng nhận (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Bản vẽ tách thửa/hợp thửa đất", "Bản vẽ trích đo địa chính được đơn vị có tư cách pháp nhân lập (.pdf)", true, 3),
                        createDocDef("CCCD/Căn cước của người sử dụng đất", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 4)
                )
        );

        // =========================================================================
        // 3. LĨNH VỰC XÂY DỰNG & ĐÔ THỊ (XAY_DUNG)
        // =========================================================================
        // 3.1. GPXD Nhà ở riêng lẻ
        createOrUpdateProcedure(
                "TTHC_XAYDUNG_01",
                "Cấp giấy phép xây dựng nhà ở riêng lẻ",
                "Cấp giấy phép xây dựng mới nhà ở riêng lẻ tại đô thị và điểm dân cư nông thôn đã có quy hoạch.",
                xayDung, 15, new BigDecimal("50000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp đơn đề nghị cấp GPXD và 02 bộ bản vẽ thiết kế\nBước 2: Phòng Quản lý đô thị thẩm định hồ sơ và kiểm tra thực địa\nBước 3: Nhận Giấy phép xây dựng kèm bản vẽ đóng dấu",
                "Đất có giấy tờ hợp pháp, phù hợp quy hoạch chi tiết xây dựng đô thị.",
                "Luật Xây dựng số 50/2014/QH13 sửa đổi 2020",
                Arrays.asList(
                        createDocDef("Đơn đề nghị cấp giấy phép xây dựng", "Mẫu số 01 theo Nghị định 15/2021/NĐ-CP (.pdf)", true, 1),
                        createDocDef("Giấy tờ chứng minh quyền sử dụng đất", "Bản sao Giấy chứng nhận quyền sử dụng đất (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Bản vẽ thiết kế xây dựng", "Bao gồm mặt bằng, mặt đứng, mặt cắt, móng và sơ đồ cấp thoát nước (.pdf)", true, 3),
                        createDocDef("CCCD/Căn cước của chủ đầu tư", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 4)
                )
        );

        // 3.2. Cấp phép sửa chữa, cải tạo nhà ở
        createOrUpdateProcedure(
                "TTHC_SUACHUANHA_01",
                "Cấp phép sửa chữa, cải tạo nhà ở",
                "Cấp giấy phép sửa chữa, cải tạo công trình nhà ở riêng lẻ có thay đổi kết cấu chịu lực hoặc mặt ngoài công trình.",
                xayDung, 10, new BigDecimal("50000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp hồ sơ đề nghị cấp phép sửa chữa, cải tạo\nBước 2: Thẩm định phương án gia cố và an toàn công trình liền kề\nBước 3: Cấp Giấy phép sửa chữa, cải tạo",
                "Công trình sửa chữa không làm ảnh hưởng tới an toàn công trình lân cận và phù hợp quy hoạch.",
                "Luật Xây dựng số 50/2014/QH13 sửa đổi 2020",
                Arrays.asList(
                        createDocDef("Đơn đề nghị cấp giấy phép sửa chữa, cải tạo", "Đơn theo mẫu số 01 (.pdf)", true, 1),
                        createDocDef("Giấy tờ chứng minh quyền sở hữu nhà/đất", "Bản sao Sổ đỏ/Sổ hồng nhà ở (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Bản vẽ hiện trạng và bản vẽ thiết kế sửa chữa", "Bản vẽ chi tiết các hạng mục thay đổi (.pdf)", true, 3),
                        createDocDef("Ảnh chụp hiện trạng công trình", "Ảnh chụp toàn cảnh mặt tiền và vị trí dự kiến cải tạo (.pdf, .jpg, .png)", true, 4),
                        createDocDef("CCCD/Căn cước của người đề nghị", "Scan/chụp rõ 2 mặt (.pdf, .jpg, .png)", true, 5)
                )
        );

        // 3.3. Cấp phép xây dựng công trình
        createOrUpdateProcedure(
                "TTHC_XAYDUNGCT_01",
                "Cấp phép xây dựng công trình",
                "Cấp giấy phép xây dựng cho các công trình không phải nhà ở riêng lẻ thuộc thẩm quyền giải quyết của UBND cấp huyện/xã.",
                xayDung, 20, new BigDecimal("100000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp hồ sơ và bản vẽ thiết kế cơ sở\nBước 2: Thẩm định hồ sơ PCCC, môi trường và kết cấu\nBước 3: Cấp Giấy phép xây dựng công trình",
                "Dự án phù hợp với quy hoạch phân khu và có báo cáo thẩm định thiết kế xây dựng.",
                "Luật Xây dựng 2014 sửa đổi 2020; Nghị định 15/2021/NĐ-CP",
                Arrays.asList(
                        createDocDef("Đơn đề nghị cấp giấy phép xây dựng công trình", "Theo mẫu quy định (.pdf)", true, 1),
                        createDocDef("Giấy tờ về quyền sử dụng đất", "Bản sao Giấy chứng nhận quyền sử dụng đất hợp pháp (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Hồ sơ và bản vẽ thiết kế công trình", "Đầy đủ các bộ môn kiến trúc, kết cấu, MEP, PCCC (.pdf)", true, 3),
                        createDocDef("CCCD/Giấy tờ pháp lý của chủ đầu tư", "CCCD cá nhân hoặc Giấy phép ĐKKD doanh nghiệp (.pdf, .jpg, .png)", true, 4)
                )
        );

        // 3.4. Xác nhận quy hoạch
        createOrUpdateProcedure(
                "TTHC_QUYHOACH_01",
                "Xác nhận thông tin quy hoạch/xây dựng",
                "Thủ tục cung cấp thông tin quy hoạch đô thị, chỉ giới đường đỏ, mật độ xây dựng và tầng cao tối đa cho người dân.",
                xayDung, 5, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp đơn yêu cầu cung cấp thông tin quy hoạch\nBước 2: Bộ phận quy hoạch tra cứu bản đồ đồ án phân khu\nBước 3: Trả văn bản cung cấp thông tin quy hoạch xây dựng",
                "Khu đất có vị trí xác định trên bản đồ địa chính địa phương.",
                "Luật Quy hoạch đô thị số 30/2009/QH12",
                Arrays.asList(
                        createDocDef("Đơn đề nghị xác nhận thông tin quy hoạch", "Trình bày rõ vị trí thửa đất cần tra cứu (.pdf)", true, 1),
                        createDocDef("Giấy chứng nhận quyền sử dụng đất", "Bản sao Sổ đỏ/Sổ hồng (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Sơ đồ vị trí khu đất", "Bản trích lục sơ đồ vị trí thửa đất (.pdf)", true, 3),
                        createDocDef("CCCD/Căn cước của người yêu cầu", "Scan/chụp rõ nét (.pdf, .jpg, .png)", true, 4)
                )
        );

        // 3.5. Cải tạo chỉnh trang đô thị
        createOrUpdateProcedure(
                "TTHC_CHINHTRANG_01",
                "Cấp phép cải tạo, chỉnh trang công trình đô thị",
                "Thủ tục cấp phép chỉnh trang, sơn sửa mặt ngoài, lắp đặt biển hiệu quảng cáo đồng bộ mặt phố đô thị.",
                xayDung, 10, new BigDecimal("50000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp hồ sơ và phương án phối cảnh chỉnh trang\nBước 2: Phòng Đô thị đối chiếu quy chuẩn kiến trúc cảnh quan tuyến phố\nBước 3: Cấp văn bản chấp thuận chỉnh trang",
                "Phương án cải tạo đảm bảo an toàn kết cấu và mỹ quan đô thị chung.",
                "Quy chế quản lý kiến trúc đô thị địa phương",
                Arrays.asList(
                        createDocDef("Đơn đề nghị cấp phép chỉnh trang công trình", "Theo mẫu đơn quy định (.pdf)", true, 1),
                        createDocDef("Giấy tờ chứng minh quyền sở hữu công trình", "Bản sao Sổ hồng hoặc hợp đồng thuê mặt bằng (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Bản vẽ hiện trạng và phương án cải tạo", "Bản vẽ phối cảnh mặt đứng công trình (.pdf)", true, 3),
                        createDocDef("Hình ảnh hiện trạng công trình", "Ảnh chụp rõ mặt tiền công trình và hai nhà lân cận (.pdf, .jpg, .png)", true, 4),
                        createDocDef("CCCD/Căn cước của người đề nghị", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 5)
                )
        );

        // =========================================================================
        // 4. LĨNH VỰC LAO ĐỘNG - TB & XÃ HỘI (LAO_DONG)
        // =========================================================================
        // 4.1. Cấp đổi thẻ BHYT
        createOrUpdateProcedure(
                "TTHC_BHYT_01",
                "Cấp đổi/cấp lại thẻ BHYT",
                "Cấp đổi hoặc cấp lại thẻ Bảo hiểm Y tế do bị mất, rách, hỏng hoặc thay đổi thông tin nhân thân.",
                laoDong, 2, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp tờ khai điều chỉnh thông tin BHXH, BHYT (Mẫu TK1-TS)\nBước 2: Cán bộ đối soát dữ liệu với Cơ quan BHXH Quận\nBước 3: Cấp thẻ BHYT điện tử trên ứng dụng VssID và bản thẻ giấy mới",
                "Người tham gia BHYT đăng ký thường trú hoặc tạm trú trên địa bàn.",
                "Luật Bảo hiểm y tế số 25/2008/QH12 sửa đổi 2014",
                Arrays.asList(
                        createDocDef("Tờ khai/phiếu đề nghị cấp đổi thẻ BHYT", "Mẫu tờ khai TK1-TS (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của người tham gia BHYT", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Thẻ BHYT cũ nếu còn", "Ảnh chụp thẻ BHYT cũ bị rách/hỏng (.pdf, .jpg, .png)", false, 3),
                        createDocDef("Giấy tờ chứng minh thông tin thay đổi", "Nếu có thay đổi về đối tượng, mức hưởng (.pdf)", false, 4)
                )
        );

        // 4.2. Trợ cấp xã hội hàng tháng
        createOrUpdateProcedure(
                "TTHC_TROCAPXH_01",
                "Trợ cấp xã hội hàng tháng",
                "Thực hiện chính sách trợ cấp xã hội hàng tháng cho đối tượng bảo trợ xã hội (người cao tuổi, người khuyết tật nặng, trẻ mồ côi).",
                laoDong, 7, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp hồ sơ đề nghị trợ cấp xã hội\nBước 2: Hội đồng xét duyệt trợ cấp xã hội cấp phường họp thẩm định\nBước 3: Chủ tịch UBND ra quyết định hưởng trợ cấp xã hội",
                "Thuộc đối tượng bảo trợ xã hội theo Nghị định 20/2021/NĐ-CP.",
                "Nghị định 20/2021/NĐ-CP của Chính phủ",
                Arrays.asList(
                        createDocDef("Tờ khai đề nghị trợ cấp xã hội", "Theo mẫu số 01 ban hành kèm Nghị định 20 (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của đối tượng", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy tờ chứng minh thuộc đối tượng hưởng", "Giấy xác nhận mức độ khuyết tật, trích lục khai tử cha mẹ... (.pdf, .jpg, .png)", true, 3),
                        createDocDef("Thông tin tài khoản nhận trợ cấp", "Bản chụp số tài khoản ngân hàng chính chủ (.pdf, .jpg, .png)", false, 4)
                )
        );

        // 4.3. Xác định mức độ khuyết tật
        createOrUpdateProcedure(
                "TTHC_KHUYETTAT_01",
                "Xác định mức độ khuyết tật",
                "Thủ tục đánh giá dạng tật, mức độ khuyết tật và cấp Giấy xác nhận mức độ khuyết tật cho người dân.",
                laoDong, 15, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp đơn đề nghị xác định mức độ khuyết tật\nBước 2: Hội đồng xác định mức độ khuyết tật tổ chức họp đánh giá\nBước 3: Cấp Giấy xác nhận mức độ khuyết tật",
                "Người có dấu hiệu khuyết tật đang cư trú tại địa phương.",
                "Luật Người khuyết tật số 51/2010/QH12; Thông tư 01/2019/TT-BLĐTBXH",
                Arrays.asList(
                        createDocDef("Đơn đề nghị xác định mức độ khuyết tật", "Theo mẫu quy định (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của người đề nghị", "Scan/chụp rõ 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Hồ sơ y tế, bệnh án liên quan", "Bản tóm tắt bệnh án, kết luận giám định y khoa nếu có (.pdf, .jpg, .png)", false, 3),
                        createDocDef("Giấy ủy quyền thực hiện", "Văn bản ủy quyền nếu người đại diện làm thay (.pdf)", false, 4)
                )
        );

        // 4.4. Trợ cấp người có công
        createOrUpdateProcedure(
                "TTHC_NGUOICOCONG_01",
                "Trợ cấp đối với đối tượng chính sách/người có công",
                "Thủ tục giải quyết chế độ ưu đãi, trợ cấp một lần hoặc hàng tháng cho người có công và thân nhân người có công với cách mạng.",
                laoDong, 10, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp đơn đề nghị và các giấy tờ minh chứng\nBước 2: Cán bộ LĐ-TB&XH đối chiếu hồ sơ lưu trữ quản lý đối tượng\nBước 3: Ban hành Quyết định hưởng chế độ trợ cấp",
                "Là người có công với cách mạng hoặc thân nhân được pháp luật công nhận.",
                "Pháp lệnh Ưu đãi người có công với cách mạng số 02/2020/UBTVQH14",
                Arrays.asList(
                        createDocDef("Đơn đề nghị hưởng chế độ chính sách", "Theo mẫu biểu ban hành (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của người đề nghị", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy tờ chứng minh người có công", "Bằng Tổ quốc ghi công, Huân/Huy chương, Giấy chứng nhận thương binh (.pdf, .jpg, .png)", true, 3),
                        createDocDef("Giấy tờ chứng minh quan hệ thân nhân", "Giấy khai sinh, Giấy kết hôn hoặc xác nhận cư trú nếu nộp cho thân nhân (.pdf, .jpg, .png)", false, 4)
                )
        );

        // 4.5. Mai táng phí
        createOrUpdateProcedure(
                "TTHC_MAITANGPHI_01",
                "Hỗ trợ mai táng phí/trợ cấp liên quan",
                "Giải quyết chế độ hỗ trợ chi phí mai táng cho thân nhân khi đối tượng bảo trợ xã hội hoặc người có công từ trần.",
                laoDong, 5, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Thân nhân nộp đơn và Trích lục khai tử\nBước 2: Cán bộ thẩm tra hồ sơ quản lý đối tượng đang hưởng trợ cấp\nBước 3: Chi trả tiền trợ cấp mai táng phí",
                "Người mất là đối tượng đang hưởng trợ cấp xã hội hoặc trợ cấp người có công hàng tháng.",
                "Nghị định 20/2021/NĐ-CP; Nghị định 131/2021/NĐ-CP",
                Arrays.asList(
                        createDocDef("Đơn đề nghị hỗ trợ mai táng phí", "Theo mẫu đơn (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của người đề nghị", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy chứng tử/Trích lục khai tử", "Bản sao hoặc bản trích lục khai tử của người mất (.pdf, .jpg, .png)", true, 3),
                        createDocDef("Giấy tờ chứng minh người mất thuộc đối tượng hưởng", "Sổ trợ cấp hoặc quyết định hưởng trợ cấp trước đây (.pdf, .jpg, .png)", true, 4)
                )
        );

        // =========================================================================
        // 5. LĨNH VỰC CHỨNG THỰC & SAO Y (CHUNG_THUC)
        // =========================================================================
        // 5.1. Chứng thực bản sao
        createOrUpdateProcedure(
                "TTHC_CHUNGTHUC_01",
                "Chứng thực bản sao từ bản chính",
                "Chứng thực tính chính xác của bản sao điện tử/bản giấy so với bản chính các giấy tờ, văn bản do cơ quan có thẩm quyền cấp.",
                chungThuc, 1, new BigDecimal("2000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Tải lên bản quét/chụp bản chính giấy tờ gốc đầy đủ các mặt\nBước 2: Cán bộ kiểm tra tính nguyên vẹn và hợp lệ\nBước 3: Ký số cấp Bản sao chứng thực điện tử có mã xác thực QR",
                "Bản chính hợp pháp, không bị tẩy xóa, sửa chữa trái pháp luật.",
                "Nghị định 23/2015/NĐ-CP; Nghị định 45/2020/NĐ-CP về thực hiện TTHC trên môi trường điện tử",
                Arrays.asList(
                        createDocDef("Bản chính giấy tờ cần chứng thực", "Scan/chụp rõ nét đầy đủ các trang/mặt của bản gốc (.pdf, .jpg, .png)", true, 1),
                        createDocDef("CCCD/Căn cước của người yêu cầu", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Bản sao cần chứng thực", "Bản scan sẵn nếu có (.pdf, .jpg, .png)", false, 3)
                )
        );

        // 5.2. Chứng thực chữ ký
        createOrUpdateProcedure(
                "TTHC_CHUKY_01",
                "Chứng thực chữ ký",
                "Chứng thực chữ ký của cá nhân trên các văn bản, giấy tờ giao dịch không thuộc diện hợp đồng.",
                chungThuc, 1, new BigDecimal("10000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp dự thảo văn bản cần chứng thực chữ ký\nBước 2: Người yêu cầu ký trước mặt người tiếp nhận hoặc ký số\nBước 3: Xác thực và đóng dấu chứng thực chữ ký",
                "Người ký có năng lực hành vi dân sự, nhận thức và làm chủ hành vi.",
                "Nghị định 23/2015/NĐ-CP của Chính phủ",
                Arrays.asList(
                        createDocDef("Văn bản cần chứng thực chữ ký", "Dự thảo văn bản hoàn chỉnh (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của người yêu cầu", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy tờ chứng minh nội dung liên quan", "Giấy tờ pháp lý bổ trợ nếu có (.pdf)", false, 3)
                )
        );

        // 5.3. Chứng thực hợp đồng giao dịch
        createOrUpdateProcedure(
                "TTHC_HOPDONG_01",
                "Chứng thực hợp đồng, giao dịch",
                "Chứng thực các hợp đồng mua bán, chuyển nhượng, tặng cho, thế chấp tài sản thuộc thẩm quyền của UBND cấp xã.",
                chungThuc, 2, new BigDecimal("50000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp hồ sơ và dự thảo hợp đồng giao dịch\nBước 2: Công chức Tư pháp kiểm tra tư cách chủ thể và tính pháp lý tài sản\nBước 3: Các bên ký hợp đồng và nhận bản chứng thực",
                "Các bên tham gia giao dịch tự nguyện, tài sản hợp pháp không bị kê biên.",
                "Nghị định 23/2015/NĐ-CP của Chính phủ",
                Arrays.asList(
                        createDocDef("Dự thảo Hợp đồng, giao dịch", "Soạn thảo đầy đủ nội dung điều khoản (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của các bên tham gia", "Scan/chụp 2 mặt của các bên (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy chứng nhận quyền sở hữu/sử dụng tài sản", "Sổ đỏ/Sổ hồng hoặc đăng ký xe... (.pdf, .jpg, .png)", true, 3),
                        createDocDef("Giấy ủy quyền giao dịch", "Bản ủy quyền công chứng nếu có bên ủy quyền (.pdf)", false, 4)
                )
        );

        // 5.4. Chứng thực phân chia di sản
        createOrUpdateProcedure(
                "TTHC_PHANCHIADISAN_01",
                "Chứng thực văn bản thỏa thuận phân chia di sản",
                "Thủ tục chứng thực văn bản thỏa thuận phân chia di sản thừa kế hoặc văn bản khai nhận di sản thừa kế.",
                chungThuc, 3, new BigDecimal("50000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp hồ sơ phân chia di sản và giấy tờ thừa kế\nBước 2: Niêm yết thông báo khai nhận di sản tại UBND phường 15 ngày\nBước 3: Ký chứng thực văn bản phân chia di sản",
                "Tất cả các đồng thừa kế tự nguyện thỏa thuận và không có tranh chấp khiếu kiện.",
                "Bộ luật Dân sự 2015; Nghị định 23/2015/NĐ-CP",
                Arrays.asList(
                        createDocDef("Văn bản thỏa thuận phân chia di sản", "Dự thảo văn bản thỏa thuận (.pdf)", true, 1),
                        createDocDef("Giấy chứng tử của người để lại di sản", "Trích lục khai tử của người đã mất (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy tờ chứng minh quan hệ thừa kế", "Giấy khai sinh, kết hôn chứng minh hàng thừa kế (.pdf, .jpg, .png)", true, 3),
                        createDocDef("Giấy tờ về tài sản/di sản", "Giấy chứng nhận quyền sở hữu tài sản (.pdf, .jpg, .png)", true, 4),
                        createDocDef("CCCD/Căn cước của các đồng thừa kế", "Scan/chụp rõ 2 mặt (.pdf, .jpg, .png)", true, 5)
                )
        );

        // 5.5. Chứng thực giấy ủy quyền
        createOrUpdateProcedure(
                "TTHC_UYQUYEN_01",
                "Chứng thực giấy ủy quyền",
                "Chứng thực việc ủy quyền của cá nhân cho người khác thực hiện các công việc, thủ tục hành chính thay mặt mình.",
                chungThuc, 1, new BigDecimal("10000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp dự thảo giấy ủy quyền và giấy tờ nhân thân\nBước 2: Cán bộ kiểm tra phạm vi ủy quyền hợp pháp\nBước 3: Người ủy quyền ký tên và nhận Giấy ủy quyền chứng thực",
                "Việc ủy quyền không có thù lao, không có nghĩa vụ bồi thường của bên được ủy quyền và không liên quan đến chuyển dịch quyền sở hữu tài sản.",
                "Nghị định 23/2015/NĐ-CP; Thông tư 01/2020/TT-BTP",
                Arrays.asList(
                        createDocDef("Giấy ủy quyền", "Soạn thảo theo mẫu quy định (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của người ủy quyền", "Scan/chụp rõ 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("CCCD/Căn cước của người được ủy quyền", "Scan/chụp rõ 2 mặt (.pdf, .jpg, .png)", true, 3),
                        createDocDef("Giấy tờ chứng minh nội dung ủy quyền", "Giấy tờ liên quan công việc ủy quyền (.pdf, .jpg, .png)", false, 4)
                )
        );

        // =========================================================================
        // 6. LĨNH VỰC HỘ KINH DOANH CÁ THỂ (KINH_DOANH)
        // =========================================================================
        // 6.1. Thành lập hộ kinh doanh
        createOrUpdateProcedure(
                "TTHC_THANHLAPHOKD_01",
                "Đăng ký thành lập hộ kinh doanh",
                "Thủ tục đăng ký thành lập mới hộ kinh doanh cá thể tại Cơ quan đăng ký kinh doanh cấp huyện/xã.",
                kinhDoanh, 3, new BigDecimal("100000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp Giấy đề nghị đăng ký hộ kinh doanh trực tuyến\nBước 2: Cơ quan thẩm định tra cứu trùng tên và ngành nghề kinh doanh\nBước 3: Cấp Giấy chứng nhận đăng ký hộ kinh doanh",
                "Ngành, nghề đăng ký kinh doanh không thuộc ngành nghề cấm đầu tư kinh doanh; Tên hộ kinh doanh đúng quy định.",
                "Nghị định 01/2021/NĐ-CP về đăng ký doanh nghiệp; Thông tư 02/2023/TT-BKHĐT",
                Arrays.asList(
                        createDocDef("Giấy đề nghị đăng ký hộ kinh doanh", "Mẫu phụ lục III-1 ban hành kèm Thông tư 02 (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của chủ hộ kinh doanh", "Scan/chụp rõ nét 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Biên bản họp thành viên hộ gia đình", "Trường hợp các thành viên gia đình cùng đăng ký (.pdf)", false, 3),
                        createDocDef("Văn bản ủy quyền làm chủ hộ", "Văn bản ủy quyền cho một thành viên làm chủ hộ (.pdf)", false, 4),
                        createDocDef("Giấy ủy quyền nộp hồ sơ", "Nếu người nộp hồ sơ không phải là chủ hộ (.pdf)", false, 5)
                )
        );

        // 6.2. Thay đổi nội dung đăng ký hộ kinh doanh
        createOrUpdateProcedure(
                "TTHC_THAYDOIHOKD_01",
                "Thay đổi nội dung đăng ký hộ kinh doanh",
                "Thủ tục đăng ký thay đổi tên hộ kinh doanh, địa chỉ, ngành nghề kinh doanh, vốn hoặc thông tin chủ hộ.",
                kinhDoanh, 3, new BigDecimal("50000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp Thông báo thay đổi nội dung đăng ký hộ kinh doanh\nBước 2: Cơ quan đối chiếu thông tin và cập nhật vào Hệ thống thông tin quốc gia\nBước 3: Cấp Giấy chứng nhận đăng ký hộ kinh doanh điều chỉnh",
                "Hộ kinh doanh đang hoạt động hợp pháp và thực hiện đầy đủ nghĩa vụ thuế.",
                "Nghị định 01/2021/NĐ-CP của Chính phủ",
                Arrays.asList(
                        createDocDef("Thông báo thay đổi nội dung đăng ký hộ kinh doanh", "Mẫu Phụ lục III-2 (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của chủ hộ kinh doanh", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy chứng nhận đăng ký hộ kinh doanh cũ", "Bản sao Giấy chứng nhận đã cấp (.pdf, .jpg, .png)", true, 3),
                        createDocDef("Giấy tờ chứng minh nội dung thay đổi", "Hợp đồng thuê địa điểm mới, văn bản thỏa thuận... (.pdf, .jpg, .png)", false, 4),
                        createDocDef("Biên bản họp thành viên hộ gia đình", "Nếu các thành viên cùng tham gia (.pdf)", false, 5)
                )
        );

        // 6.3. Tạm ngừng kinh doanh
        createOrUpdateProcedure(
                "TTHC_TAMNGUNGHOKD_01",
                "Tạm ngừng kinh doanh",
                "Thủ tục thông báo tạm ngừng hoạt động kinh doanh có thời hạn của hộ kinh doanh cá thể.",
                kinhDoanh, 3, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Gửi thông báo tạm ngừng kinh doanh trước ít nhất 03 ngày làm việc\nBước 2: Cơ quan tiếp nhận và cập nhật trạng thái tạm ngừng\nBước 3: Cấp Giấy xác nhận về việc hộ kinh doanh đăng ký tạm ngừng",
                "Thời hạn tạm ngừng của mỗi lần thông báo không được quá 01 năm.",
                "Nghị định 01/2021/NĐ-CP của Chính phủ",
                Arrays.asList(
                        createDocDef("Thông báo về việc tạm ngừng kinh doanh", "Mẫu Phụ lục III-4 (.pdf)", true, 1),
                        createDocDef("CCCD/Căn cước của chủ hộ", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Giấy ủy quyền thực hiện thủ tục", "Nếu người khác nộp thay (.pdf)", false, 3)
                )
        );

        // 6.4. Chấm dứt hoạt động hộ kinh doanh
        createOrUpdateProcedure(
                "TTHC_CHAMDUTHOKD_01",
                "Chấm dứt hoạt động hộ kinh doanh",
                "Thủ tục thông báo giải thể, chấm dứt hoạt động của hộ kinh doanh cá thể và nộp lại Giấy chứng nhận.",
                kinhDoanh, 3, BigDecimal.ZERO, "Trực tuyến & Trực tiếp",
                "Bước 1: Hoàn thành nghĩa vụ thuế tại Chi cục Thuế và nộp thông báo chấm dứt\nBước 2: Nộp lại bản gốc Giấy chứng nhận đăng ký hộ kinh doanh\nBước 3: Cơ quan đăng ký xóa tên hộ kinh doanh trong sổ bộ",
                "Hộ kinh doanh đã thanh toán đầy đủ các khoản nợ, nghĩa vụ thuế và nghĩa vụ tài chính khác.",
                "Nghị định 01/2021/NĐ-CP của Chính phủ",
                Arrays.asList(
                        createDocDef("Thông báo chấm dứt hoạt động hộ kinh doanh", "Mẫu Phụ lục III-5 (.pdf)", true, 1),
                        createDocDef("Bản gốc Giấy chứng nhận đăng ký hộ kinh doanh", "Scan/chụp bản gốc (.pdf, .jpg, .png)", true, 2),
                        createDocDef("Văn bản xác nhận hoàn thành nghĩa vụ thuế", "Do Cơ quan Thuế cấp (.pdf)", true, 3),
                        createDocDef("CCCD/Căn cước của chủ hộ kinh doanh", "Scan/chụp 2 mặt (.pdf, .jpg, .png)", true, 4)
                )
        );

        // 6.5. Thay đổi chủ hộ kinh doanh
        createOrUpdateProcedure(
                "TTHC_THAYDOICHUHOKD_01",
                "Đăng ký thay đổi chủ hộ kinh doanh",
                "Thủ tục chuyển quyền quản lý, thay đổi người đại diện theo pháp luật / chủ hộ kinh doanh cho cá nhân khác.",
                kinhDoanh, 3, new BigDecimal("50000"), "Trực tuyến & Trực tiếp",
                "Bước 1: Nộp thông báo thay đổi chủ hộ và văn bản chuyển nhượng/tặng cho\nBước 2: Cơ quan thẩm định tính hợp lệ của chủ hộ mới\nBước 3: Cấp Giấy chứng nhận đăng ký hộ kinh doanh ghi nhận chủ hộ mới",
                "Chủ hộ kinh doanh mới đáp ứng đầy đủ điều kiện thành lập hộ kinh doanh theo quy định.",
                "Nghị định 01/2021/NĐ-CP của Chính phủ",
                Arrays.asList(
                        createDocDef("Thông báo đăng ký thay đổi chủ hộ kinh doanh", "Theo mẫu biểu quy định (.pdf)", true, 1),
                        createDocDef("Hợp đồng chuyển nhượng/tặng cho hộ kinh doanh", "Hợp đồng hoặc văn bản xác nhận quyền thừa kế (.pdf)", true, 2),
                        createDocDef("CCCD/Căn cước của chủ hộ mới", "Scan/chụp rõ nét 2 mặt (.pdf, .jpg, .png)", true, 3),
                        createDocDef("CCCD/Căn cước của chủ hộ cũ", "Scan/chụp rõ nét 2 mặt (.pdf, .jpg, .png)", true, 4),
                        createDocDef("Bản gốc Giấy chứng nhận đăng ký hộ kinh doanh", "Scan/chụp bản gốc đã cấp (.pdf, .jpg, .png)", true, 5)
                )
        );
    }

    private static class DocDef {
        String name;
        String desc;
        boolean required;
        int orderIndex;
        DocDef(String name, String desc, boolean required, int orderIndex) {
            this.name = name;
            this.desc = desc;
            this.required = required;
            this.orderIndex = orderIndex;
        }
    }

    private DocDef createDocDef(String name, String desc, boolean required, int orderIndex) {
        return new DocDef(name, desc, required, orderIndex);
    }

    private void createOrUpdateProcedure(String code, String name, String desc, ProcedureCategory category,
                                         int durationDays, BigDecimal fee, String submissionMethod,
                                         String implementationSteps, String conditions, String legalBasis,
                                         List<DocDef> docs) {
        Procedure proc = procedureRepository.findByCode(code).orElseGet(() -> Procedure.builder().code(code).build());
        proc.setName(name);
        proc.setDescription(desc);
        proc.setCategory(category);
        proc.setProcessingDurationDays(durationDays);
        proc.setFee(fee);
        proc.setSubmissionMethod(submissionMethod);
        proc.setImplementationSteps(implementationSteps);
        proc.setConditions(conditions);
        proc.setLegalBasis(legalBasis);
        proc.setActive(true);

        Procedure saved = procedureRepository.save(proc);

        // Update existing docs in-place or create new ones (do not hard-delete to avoid FK constraint violations)
        List<ProcedureRequiredDocument> existingDocs = documentRepository.findByProcedure(saved);
        for (DocDef d : docs) {
            ProcedureRequiredDocument doc = existingDocs.stream()
                    .filter(ed -> ed.getDocumentName() != null && ed.getDocumentName().equalsIgnoreCase(d.name))
                    .findFirst()
                    .orElseGet(() -> ProcedureRequiredDocument.builder()
                            .procedure(saved)
                            .documentName(d.name)
                            .build());

            doc.setDescription(d.desc);
            doc.setRequired(d.required);
            doc.setOrderIndex(d.orderIndex);
            documentRepository.save(doc);
        }
    }

    private ProcedureCategory getOrCreateCategory(String code, String name, String description, String icon) {
        return categoryRepository.findByCode(code).orElseGet(() -> {
            ProcedureCategory cat = ProcedureCategory.builder()
                    .code(code)
                    .name(name)
                    .description(description)
                    .icon(icon)
                    .active(true)
                    .build();
            return categoryRepository.save(cat);
        });
    }

    private void initFaqs() {
        if (faqRepository.count() > 0) return;

        List<Faq> faqs = Arrays.asList(
                Faq.builder()
                        .question("Tôi cần chuẩn bị giấy tờ gì khi đăng ký khai sinh trực tuyến?")
                        .answer("Bạn cần chuẩn bị: (1) Giấy chứng sinh do bệnh viện/trung tâm y tế cấp, (2) CCCD của người nộp hồ sơ, (3) Giấy chứng nhận kết hôn của cha mẹ (nếu có). Tất cả tài liệu tải lên dưới dạng file ảnh (JPG, PNG) hoặc PDF rõ nét.")
                        .category("Hộ tịch")
                        .orderIndex(1)
                        .active(true)
                        .build(),
                Faq.builder()
                        .question("Thời gian xử lý hồ sơ cấp Giấy xác nhận tình trạng hôn nhân là bao lâu?")
                        .answer("Thời gian xử lý theo quy định là không quá 03 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ. Trường hợp cần xác minh thêm thì không quá 10 ngày làm việc.")
                        .category("Hộ tịch")
                        .orderIndex(2)
                        .active(true)
                        .build(),
                Faq.builder()
                        .question("Hồ sơ bị yêu cầu bổ sung thì tôi phải làm thế nào?")
                        .answer("Khi cán bộ yêu cầu bổ sung, bạn sẽ nhận được thông báo kèm lý do chi tiết. Hãy vào mục 'Hồ sơ của tôi', chọn hồ sơ cần bổ sung, tải lên các tài liệu còn thiếu và bấm 'Nộp lại hồ sơ'.")
                        .category("Hồ sơ")
                        .orderIndex(3)
                        .active(true)
                        .build(),
                Faq.builder()
                        .question("Bộ phận Tiếp nhận & Trả kết quả làm việc vào những khung giờ nào?")
                        .answer("Thời gian tiếp nhận và trả kết quả: Từ Thứ Hai đến Thứ Sáu (Sáng 07:30 - 11:30, Chiều 13:30 - 17:00) và Sáng Thứ Bảy (07:30 - 11:30). Nghỉ chiều Thứ Bảy, Chủ Nhật và ngày Lễ.")
                        .category("Hỏi đáp chung")
                        .orderIndex(4)
                        .active(true)
                        .build()
        );

        faqRepository.saveAll(faqs);
    }

    private void initChatbotSettings() {
        if (!chatbotSettingRepository.existsBySettingKey(ChatbotService.SETTING_PERSONA_TONE)) {
            ChatbotSetting setting = ChatbotSetting.builder()
                    .settingKey(ChatbotService.SETTING_PERSONA_TONE)
                    .settingValue(ChatbotService.TONE_CITIZEN_ASSISTANT)
                    .description("Phong cách bối cảnh xưng hô của Trợ lý AI")
                    .build();
            chatbotSettingRepository.save(setting);
            log.info("Initialized Chatbot Persona Tone: {}", ChatbotService.TONE_CITIZEN_ASSISTANT);
        }
    }
}

