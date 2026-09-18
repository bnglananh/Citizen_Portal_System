import { Procedure, ProcedureCategory } from '../models/procedure.model';

export const INITIAL_CATEGORIES: ProcedureCategory[] = [
  {
    id: 1,
    code: 'HO_TICH',
    name: 'Hộ tịch & Tư pháp',
    description: 'Các thủ tục đăng ký khai sinh, kết hôn, khai tử, trích lục và xác nhận tình trạng hôn nhân',
    icon: 'user',
    active: true
  },
  {
    id: 2,
    code: 'DAT_DAI',
    name: 'Đất đai & Môi trường',
    description: 'Các thủ tục đăng ký biến động, cấp đổi sổ đỏ, xác nhận hiện trạng sử dụng đất',
    icon: 'home',
    active: true
  },
  {
    id: 3,
    code: 'XAY_DUNG',
    name: 'Xây dựng & Đô thị',
    description: 'Thủ tục cấp phép xây dựng nhà ở riêng lẻ, sửa chữa, cải tạo công trình đô thị',
    icon: 'build',
    active: true
  },
  {
    id: 4,
    code: 'LAO_DONG',
    name: 'Lao động - TB & Xã hội',
    description: 'Thủ tục cấp đổi thẻ BHYT, trợ cấp xã hội, xác nhận đối tượng chính sách',
    icon: 'team',
    active: true
  },
  {
    id: 5,
    code: 'CHUNG_THUC',
    name: 'Chứng thực & Sao y',
    description: 'Chứng thực bản sao từ bản chính, chứng thực chữ ký, chứng thực hợp đồng giao dịch',
    icon: 'file-done',
    active: true
  },
  {
    id: 6,
    code: 'KINH_DOANH',
    name: 'Hộ kinh doanh cá thể',
    description: 'Đăng ký thành lập mới, thay đổi nội dung đăng ký, tạm ngừng kinh doanh hộ cá thể',
    icon: 'shop',
    active: true
  }
];

export const INITIAL_PROCEDURES: Procedure[] = [
  // ==========================================
  // 1. HO_TICH – Hộ tịch & Tư pháp
  // ==========================================
  {
    id: 1,
    categoryId: 1,
    categoryName: 'Hộ tịch & Tư pháp',
    code: 'TTHC_KHAISINH_01',
    name: 'Đăng ký khai sinh',
    description: 'Thủ tục đăng ký khai sinh cho trẻ em sinh ra tại Việt Nam có cha mẹ là công dân Việt Nam.',
    processingTimeDays: 1,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Điền tờ khai trực tuyến hoặc tải lên bản scan tờ khai\nBước 2: Cán bộ tiếp nhận và kiểm tra hồ sơ giấy chứng sinh\nBước 3: Cấp trích lục khai sinh điện tử và số định danh cá nhân',
    conditions: 'Trẻ em được sinh ra trong lãnh thổ Việt Nam có cha hoặc mẹ là công dân Việt Nam.',
    legalBasis: 'Luật Hộ tịch số 60/2014/QH13; Nghị định 123/2015/NĐ-CP',
    requiredDocuments: [
      { id: 101, procedureId: 1, documentName: 'Tờ khai đăng ký khai sinh', description: 'Điền trực tuyến hoặc bản quét có chữ ký', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 102, procedureId: 1, documentName: 'Giấy chứng sinh', description: 'Bản quét hoặc ảnh chụp rõ nét', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 103, procedureId: 1, documentName: 'CCCD/Căn cước của cha hoặc mẹ', description: 'Quét/chụp mặt trước và mặt sau', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 104, procedureId: 1, documentName: 'Giấy tờ chứng minh nơi cư trú', description: 'Cung cấp khi cơ quan không tra cứu được dữ liệu', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 2,
    categoryId: 1,
    categoryName: 'Hộ tịch & Tư pháp',
    code: 'TTHC_KETHON_01',
    name: 'Đăng ký kết hôn',
    description: 'Thủ tục đăng ký kết hôn giữa hai công dân Việt Nam cư trú tại địa phương.',
    processingTimeDays: 1,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp tờ khai và hồ sơ trực tuyến\nBước 2: Công chức Tư pháp kiểm tra điều kiện kết hôn\nBước 3: Hai bên nam nữ ký Giấy chứng nhận kết hôn tại UBND',
    conditions: 'Nam từ đủ 20 tuổi, nữ từ đủ 18 tuổi; tự nguyện; không mất năng lực hành vi dân sự.',
    legalBasis: 'Luật Hôn nhân và Gia đình số 52/2014/QH13',
    requiredDocuments: [
      { id: 105, procedureId: 2, documentName: 'Tờ khai đăng ký kết hôn', description: 'Điền trực tuyến hoặc upload bản đã ký', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 106, procedureId: 2, documentName: 'CCCD/Căn cước của hai bên nam, nữ', description: 'Scan/chụp rõ 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 107, procedureId: 2, documentName: 'Giấy xác nhận tình trạng hôn nhân', description: 'Trường hợp cư trú khác phường/xã', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 108, procedureId: 2, documentName: 'Giấy tờ chứng minh chấm dứt hôn nhân cũ', description: 'Bản án/Quyết định ly hôn hoặc Giấy chứng tử (nếu có)', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 3,
    categoryId: 1,
    categoryName: 'Hộ tịch & Tư pháp',
    code: 'TTHC_KHAITU_01',
    name: 'Đăng ký khai tử',
    description: 'Thủ tục đăng ký khai tử cho người qua đời tại địa phương.',
    processingTimeDays: 1,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp hồ sơ và Giấy báo tử trực tuyến\nBước 2: Cán bộ hộ tịch đối chiếu và ghi sổ hộ tịch\nBước 3: Trả Trích lục khai tử',
    conditions: 'Người đã mất có sự kiện chết xảy ra trên địa bàn hoặc có nơi cư trú cuối cùng tại địa phương.',
    legalBasis: 'Luật Hộ tịch số 60/2014/QH13',
    requiredDocuments: [
      { id: 109, procedureId: 3, documentName: 'Tờ khai đăng ký khai tử', description: 'Điền trực tuyến hoặc bản nộp có chữ ký', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 110, procedureId: 3, documentName: 'Giấy báo tử', description: 'Do cơ sở y tế cấp hoặc văn bản thay thế Giấy báo tử', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 111, procedureId: 3, documentName: 'CCCD/Căn cước của người đi đăng ký', description: 'Scan/chụp mặt trước và mặt sau', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 112, procedureId: 3, documentName: 'Giấy tờ liên quan đến người đã mất', description: 'CCCD hoặc giấy tờ tùy thân người mất nếu có', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 4,
    categoryId: 1,
    categoryName: 'Hộ tịch & Tư pháp',
    code: 'TTHC_TRICHLUC_01',
    name: 'Cấp bản sao/trích lục hộ tịch',
    description: 'Thủ tục cấp bản sao trích lục khai sinh, trích lục kết hôn, trích lục khai tử từ Cơ sở dữ liệu hộ tịch.',
    processingTimeDays: 1,
    feeAmount: 8000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp tờ khai trích lục hộ tịch trực tuyến\nBước 2: Cán bộ tra cứu cơ sở dữ liệu hộ tịch điện tử\nBước 3: Xuất bản sao trích lục điện tử hoặc bản giấy',
    conditions: 'Cá nhân có yêu cầu cấp bản sao trích lục hộ tịch của mình hoặc người có quyền theo quy định.',
    legalBasis: 'Nghị định 123/2015/NĐ-CP; Thông tư 04/2020/TT-BTP',
    requiredDocuments: [
      { id: 113, procedureId: 4, documentName: 'Tờ khai cấp bản sao/trích lục hộ tịch', description: 'Kèm thông tin họ tên, ngày sinh, nơi đăng ký', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 114, procedureId: 4, documentName: 'CCCD/Căn cước của người yêu cầu', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 115, procedureId: 4, documentName: 'Giấy ủy quyền thực hiện thủ tục', description: 'Bắt buộc nếu ủy quyền cho người khác thực hiện thay', isRequired: false, allowedExtensions: ['.pdf'] }
    ]
  },
  {
    id: 5,
    categoryId: 1,
    categoryName: 'Hộ tịch & Tư pháp',
    code: 'TTHC_HONNHAN_01',
    name: 'Cấp Giấy xác nhận tình trạng hôn nhân',
    description: 'Thủ tục cấp giấy xác nhận tình trạng độc thân để làm thủ tục kết hôn hoặc giao dịch dân sự, nhà đất.',
    processingTimeDays: 3,
    feeAmount: 15000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp đơn và hồ sơ trực tuyến\nBước 2: Cán bộ thẩm tra cơ sở dữ liệu hộ tịch\nBước 3: Cấp Giấy xác nhận tình trạng hôn nhân',
    conditions: 'Công dân Việt Nam thường trú hoặc tạm trú tại địa phương.',
    legalBasis: 'Thông tư 04/2020/TT-BTP của Bộ Tư pháp',
    requiredDocuments: [
      { id: 116, procedureId: 5, documentName: 'Tờ khai cấp Giấy xác nhận tình trạng hôn nhân', description: 'Điền theo mẫu quy định', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 117, procedureId: 5, documentName: 'CCCD/Căn cước của người yêu cầu', description: 'Scan/chụp rõ nét 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 118, procedureId: 5, documentName: 'Giấy tờ chứng minh tình trạng hôn nhân cũ', description: 'Bản án ly hôn hoặc Giấy chứng tử của vợ/chồng cũ (nếu có)', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },

  // ==========================================
  // 2. DAT_DAI – Đất đai & Môi trường
  // ==========================================
  {
    id: 6,
    categoryId: 2,
    categoryName: 'Đất đai & Môi trường',
    code: 'TTHC_BIENDONGDAT_01',
    name: 'Đăng ký biến động đất đai',
    description: 'Thủ tục đăng ký biến động quyền sử dụng đất trong các trường hợp chuyển nhượng, tặng cho, thừa kế hoặc thay đổi thông tin.',
    processingTimeDays: 10,
    feeAmount: 28000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp hồ sơ đăng ký biến động trực tuyến\nBước 2: Chi nhánh VP Đăng ký đất đai kiểm tra thực địa & nghĩa vụ tài chính\nBước 3: Xác nhận biến động vào Giấy chứng nhận',
    conditions: 'Có Giấy chứng nhận hợp pháp, đất không có tranh chấp và trong thời hạn sử dụng đất.',
    legalBasis: 'Luật Đất đai số 31/2024/QH15; Nghị định 101/2024/NĐ-CP',
    requiredDocuments: [
      { id: 201, procedureId: 6, documentName: 'Đơn đăng ký biến động đất đai, tài sản gắn liền với đất', description: 'Điền theo mẫu Mẫu số 11/ĐK', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 202, procedureId: 6, documentName: 'Giấy chứng nhận quyền sử dụng đất (Sổ đỏ/sổ hồng)', description: 'Bản scan hoặc ảnh chụp đầy đủ các trang', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 203, procedureId: 6, documentName: 'Hợp đồng/văn bản chuyển quyền sử dụng đất', description: 'Hợp đồng chuyển nhượng, tặng cho, thừa kế đã công chứng', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 204, procedureId: 6, documentName: 'CCCD/Căn cước của người thực hiện thủ tục', description: 'Bản scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 205, procedureId: 6, documentName: 'Giấy ủy quyền thực hiện thủ tục', description: 'Văn bản ủy quyền hợp pháp nếu nộp qua người đại diện', isRequired: false, allowedExtensions: ['.pdf'] }
    ]
  },
  {
    id: 7,
    categoryId: 2,
    categoryName: 'Đất đai & Môi trường',
    code: 'TTHC_CAPDOISODO_01',
    name: 'Cấp đổi Giấy chứng nhận quyền sử dụng đất',
    description: 'Cấp đổi Giấy chứng nhận do bị ố, nhòe, rách, hư hỏng hoặc do đo đạc lại bản đồ địa chính.',
    processingTimeDays: 7,
    feeAmount: 50000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp đơn đề nghị cấp đổi trực tuyến\nBước 2: Nộp bản gốc Giấy chứng nhận cũ\nBước 3: Nhận Giấy chứng nhận mới theo mẫu thống nhất',
    conditions: 'Người sử dụng đất có nhu cầu cấp đổi Giấy chứng nhận đã được cấp.',
    legalBasis: 'Luật Đất đai 2024; Nghị định 101/2024/NĐ-CP',
    requiredDocuments: [
      { id: 206, procedureId: 7, documentName: 'Đơn đề nghị cấp đổi Giấy chứng nhận', description: 'Đơn theo mẫu quy định', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 207, procedureId: 7, documentName: 'Bản gốc Giấy chứng nhận quyền sử dụng đất', description: 'Bản quét các trang để đối chiếu', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 208, procedureId: 7, documentName: 'CCCD/Căn cước của chủ sử dụng đất', description: 'Scan/chụp rõ 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 209, procedureId: 7, documentName: 'Giấy tờ liên quan đến thay đổi thông tin', description: 'Giấy tờ chứng minh thay đổi số CCCD, địa chỉ nếu có', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 8,
    categoryId: 2,
    categoryName: 'Đất đai & Môi trường',
    code: 'TTHC_HIENTRANGDAT_01',
    name: 'Xác nhận hiện trạng sử dụng đất',
    description: 'Thủ tục xác nhận hiện trạng ranh giới, diện tích, mục đích và tình trạng tranh chấp thửa đất tại địa phương.',
    processingTimeDays: 5,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp đơn đề nghị xác nhận hiện trạng\nBước 2: Cán bộ Địa chính kiểm tra hồ sơ và khảo sát thực địa\nBước 3: UBND cấp Giấy xác nhận hiện trạng',
    conditions: 'Thửa đất thuộc địa giới hành chính của phường/xã.',
    legalBasis: 'Luật Đất đai số 31/2024/QH15',
    requiredDocuments: [
      { id: 210, procedureId: 8, documentName: 'Đơn đề nghị xác nhận hiện trạng sử dụng đất', description: 'Đơn trình bày rõ mục đích yêu cầu', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 211, procedureId: 8, documentName: 'CCCD/Căn cước của người yêu cầu', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 212, procedureId: 8, documentName: 'Giấy chứng nhận quyền sử dụng đất', description: 'Bản sao nếu đã được cấp Giấy chứng nhận', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 213, procedureId: 8, documentName: 'Sơ đồ/bản vẽ hiện trạng khu đất', description: 'Bản vẽ trích lục sơ đồ thửa đất', isRequired: false, allowedExtensions: ['.pdf'] }
    ]
  },
  {
    id: 9,
    categoryId: 2,
    categoryName: 'Đất đai & Môi trường',
    code: 'TTHC_CAPLANDAUDAT_01',
    name: 'Đăng ký cấp Giấy chứng nhận quyền sử dụng đất lần đầu',
    description: 'Thủ tục đăng ký, cấp Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất lần đầu cho hộ gia đình, cá nhân.',
    processingTimeDays: 30,
    feeAmount: 100000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp hồ sơ đăng ký cấp Giấy chứng nhận lần đầu\nBước 2: UBND phường công khai hiện trạng, niêm phong nguồn gốc đất\nBước 3: Chi nhánh VP ĐKĐĐ thẩm định & trao Giấy chứng nhận',
    conditions: 'Đất sử dụng ổn định, có giấy tờ theo quy định hoặc đủ điều kiện công nhận.',
    legalBasis: 'Luật Đất đai số 31/2024/QH15; Nghị định 101/2024/NĐ-CP',
    requiredDocuments: [
      { id: 214, procedureId: 9, documentName: 'Đơn đăng ký đất đai, tài sản gắn liền với đất', description: 'Mẫu số 04a/ĐK theo quy định', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 215, procedureId: 9, documentName: 'Giấy tờ chứng minh quyền sử dụng đất', description: 'Các giấy tờ về nguồn gốc, quá trình sử dụng đất trước đây', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 216, procedureId: 9, documentName: 'Sơ đồ nhà ở/công trình gắn liền với đất', description: 'Bản vẽ hoàn công hoặc sơ đồ hiện trạng công trình', isRequired: false, allowedExtensions: ['.pdf'] },
      { id: 217, procedureId: 9, documentName: 'CCCD/Căn cước của người nộp hồ sơ', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 10,
    categoryId: 2,
    categoryName: 'Đất đai & Môi trường',
    code: 'TTHC_TACHTHUA_01',
    name: 'Đăng ký tách thửa/hợp thửa đất',
    description: 'Thủ tục tách một thửa đất thành nhiều thửa hoặc hợp nhiều thửa đất liền kề thành một thửa theo nhu cầu sử dụng.',
    processingTimeDays: 15,
    feeAmount: 50000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp đơn đề nghị tách/hợp thửa kèm bản vẽ\nBước 2: Cơ quan thẩm định kiểm tra điều kiện diện tích tối thiểu\nBước 3: Cấp các Giấy chứng nhận mới tương ứng',
    conditions: 'Thửa đất đáp ứng đủ điều kiện về diện tích, kích thước cạnh tối thiểu.',
    legalBasis: 'Luật Đất đai 2024; Nghị định 101/2024/NĐ-CP',
    requiredDocuments: [
      { id: 218, procedureId: 10, documentName: 'Đơn đề nghị tách thửa/hợp thửa đất', description: 'Đơn theo mẫu Mẫu số 11/ĐK', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 219, procedureId: 10, documentName: 'Bản gốc Giấy chứng nhận quyền sử dụng đất', description: 'Scan/chụp các trang Giấy chứng nhận', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 220, procedureId: 10, documentName: 'Bản vẽ tách thửa/hợp thửa đất', description: 'Bản vẽ trích đo địa chính được đơn vị có tư cách pháp nhân lập', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 221, procedureId: 10, documentName: 'CCCD/Căn cước của người sử dụng đất', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },

  // ==========================================
  // 3. XAY_DUNG – Xây dựng & Đô thị
  // ==========================================
  {
    id: 11,
    categoryId: 3,
    categoryName: 'Xây dựng & Đô thị',
    code: 'TTHC_XAYDUNG_01',
    name: 'Cấp giấy phép xây dựng nhà ở riêng lẻ',
    description: 'Cấp giấy phép xây dựng mới nhà ở riêng lẻ tại đô thị và điểm dân cư nông thôn đã có quy hoạch.',
    processingTimeDays: 15,
    feeAmount: 50000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp đơn đề nghị cấp GPXD và 02 bộ bản vẽ thiết kế\nBước 2: Phòng Quản lý đô thị thẩm định hồ sơ và kiểm tra thực địa\nBước 3: Nhận Giấy phép xây dựng kèm bản vẽ đóng dấu',
    conditions: 'Đất có giấy tờ hợp pháp, phù hợp quy hoạch chi tiết xây dựng đô thị.',
    legalBasis: 'Luật Xây dựng số 50/2014/QH13 sửa đổi 2020',
    requiredDocuments: [
      { id: 301, procedureId: 11, documentName: 'Đơn đề nghị cấp giấy phép xây dựng', description: 'Mẫu số 01 theo Nghị định 15/2021/NĐ-CP', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 302, procedureId: 11, documentName: 'Giấy tờ chứng minh quyền sử dụng đất', description: 'Bản sao Giấy chứng nhận quyền sử dụng đất', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 303, procedureId: 11, documentName: 'Bản vẽ thiết kế xây dựng', description: 'Mặt bằng, mặt đứng, mặt cắt, móng và sơ đồ cấp thoát nước', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 304, procedureId: 11, documentName: 'CCCD/Căn cước của chủ đầu tư', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 12,
    categoryId: 3,
    categoryName: 'Xây dựng & Đô thị',
    code: 'TTHC_SUACHUANHA_01',
    name: 'Cấp phép sửa chữa, cải tạo nhà ở',
    description: 'Cấp giấy phép sửa chữa, cải tạo công trình nhà ở riêng lẻ có thay đổi kết cấu chịu lực hoặc mặt ngoài công trình.',
    processingTimeDays: 10,
    feeAmount: 50000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp hồ sơ đề nghị cấp phép sửa chữa, cải tạo\nBước 2: Thẩm định phương án gia cố và an toàn công trình liền kề\nBước 3: Cấp Giấy phép sửa chữa, cải tạo',
    conditions: 'Công trình sửa chữa không làm ảnh hưởng tới an toàn công trình lân cận.',
    legalBasis: 'Luật Xây dựng số 50/2014/QH13 sửa đổi 2020',
    requiredDocuments: [
      { id: 305, procedureId: 12, documentName: 'Đơn đề nghị cấp giấy phép sửa chữa, cải tạo', description: 'Đơn theo mẫu số 01', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 306, procedureId: 12, documentName: 'Giấy tờ chứng minh quyền sở hữu nhà/đất', description: 'Bản sao Sổ đỏ/Sổ hồng nhà ở', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 307, procedureId: 12, documentName: 'Bản vẽ hiện trạng và bản vẽ thiết kế sửa chữa', description: 'Bản vẽ chi tiết các hạng mục thay đổi', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 308, procedureId: 12, documentName: 'Ảnh chụp hiện trạng công trình', description: 'Ảnh chụp toàn cảnh mặt tiền và vị trí dự kiến cải tạo', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 309, procedureId: 12, documentName: 'CCCD/Căn cước của người đề nghị', description: 'Scan/chụp rõ 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 13,
    categoryId: 3,
    categoryName: 'Xây dựng & Đô thị',
    code: 'TTHC_XAYDUNGCT_01',
    name: 'Cấp phép xây dựng công trình',
    description: 'Cấp giấy phép xây dựng cho các công trình không phải nhà ở riêng lẻ thuộc thẩm quyền của UBND cấp huyện/xã.',
    processingTimeDays: 20,
    feeAmount: 100000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp hồ sơ và bản vẽ thiết kế cơ sở\nBước 2: Thẩm định hồ sơ PCCC, môi trường và kết cấu\nBước 3: Cấp Giấy phép xây dựng công trình',
    conditions: 'Dự án phù hợp với quy hoạch phân khu và có báo cáo thẩm định thiết kế xây dựng.',
    legalBasis: 'Luật Xây dựng 2014 sửa đổi 2020; Nghị định 15/2021/NĐ-CP',
    requiredDocuments: [
      { id: 310, procedureId: 13, documentName: 'Đơn đề nghị cấp giấy phép xây dựng công trình', description: 'Theo mẫu quy định', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 311, procedureId: 13, documentName: 'Giấy tờ về quyền sử dụng đất', description: 'Bản sao Giấy chứng nhận quyền sử dụng đất hợp pháp', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 312, procedureId: 13, documentName: 'Hồ sơ và bản vẽ thiết kế công trình', description: 'Đầy đủ các bộ môn kiến trúc, kết cấu, MEP, PCCC', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 313, procedureId: 13, documentName: 'CCCD/Giấy tờ pháp lý của chủ đầu tư', description: 'CCCD cá nhân hoặc Giấy phép ĐKKD doanh nghiệp', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 14,
    categoryId: 3,
    categoryName: 'Xây dựng & Đô thị',
    code: 'TTHC_QUYHOACH_01',
    name: 'Xác nhận thông tin quy hoạch/xây dựng',
    description: 'Thủ tục cung cấp thông tin quy hoạch đô thị, chỉ giới đường đỏ, mật độ xây dựng và tầng cao tối đa cho người dân.',
    processingTimeDays: 5,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp đơn yêu cầu cung cấp thông tin quy hoạch\nBước 2: Bộ phận quy hoạch tra cứu bản đồ đồ án phân khu\nBước 3: Trả văn bản cung cấp thông tin quy hoạch xây dựng',
    conditions: 'Khu đất có vị trí xác định trên bản đồ địa chính địa phương.',
    legalBasis: 'Luật Quy hoạch đô thị số 30/2009/QH12',
    requiredDocuments: [
      { id: 314, procedureId: 14, documentName: 'Đơn đề nghị xác nhận thông tin quy hoạch', description: 'Trình bày rõ vị trí thửa đất cần tra cứu', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 315, procedureId: 14, documentName: 'Giấy chứng nhận quyền sử dụng đất', description: 'Bản sao Sổ đỏ/Sổ hồng', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 316, procedureId: 14, documentName: 'Sơ đồ vị trí khu đất', description: 'Bản trích lục sơ đồ vị trí thửa đất', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 317, procedureId: 14, documentName: 'CCCD/Căn cước của người yêu cầu', description: 'Scan/chụp rõ nét', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 15,
    categoryId: 3,
    categoryName: 'Xây dựng & Đô thị',
    code: 'TTHC_CHINHTRANG_01',
    name: 'Cấp phép cải tạo, chỉnh trang công trình đô thị',
    description: 'Thủ tục cấp phép chỉnh trang, sơn sửa mặt ngoài, lắp đặt biển hiệu quảng cáo đồng bộ mặt phố đô thị.',
    processingTimeDays: 10,
    feeAmount: 50000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp hồ sơ và phương án phối cảnh chỉnh trang\nBước 2: Phòng Đô thị đối chiếu quy chuẩn kiến trúc cảnh quan tuyến phố\nBước 3: Cấp văn bản chấp thuận chỉnh trang',
    conditions: 'Phương án cải tạo đảm bảo an toàn kết cấu và mỹ quan đô thị.',
    legalBasis: 'Quy chế quản lý kiến trúc đô thị địa phương',
    requiredDocuments: [
      { id: 318, procedureId: 15, documentName: 'Đơn đề nghị cấp phép chỉnh trang công trình', description: 'Theo mẫu đơn quy định', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 319, procedureId: 15, documentName: 'Giấy tờ chứng minh quyền sở hữu công trình', description: 'Bản sao Sổ hồng hoặc hợp đồng thuê mặt bằng', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 320, procedureId: 15, documentName: 'Bản vẽ hiện trạng và phương án cải tạo', description: 'Bản vẽ phối cảnh mặt đứng công trình', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 321, procedureId: 15, documentName: 'Hình ảnh hiện trạng công trình', description: 'Ảnh chụp rõ mặt tiền công trình và hai nhà lân cận', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 322, procedureId: 15, documentName: 'CCCD/Căn cước của người đề nghị', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },

  // ==========================================
  // 4. LAO_DONG – Lao động - TB & Xã hội
  // ==========================================
  {
    id: 16,
    categoryId: 4,
    categoryName: 'Lao động - TB & Xã hội',
    code: 'TTHC_BHYT_01',
    name: 'Cấp đổi/cấp lại thẻ BHYT',
    description: 'Cấp đổi hoặc cấp lại thẻ Bảo hiểm Y tế do bị mất, rách, hỏng hoặc thay đổi thông tin nhân thân.',
    processingTimeDays: 2,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp tờ khai điều chỉnh thông tin BHXH, BHYT (Mẫu TK1-TS)\nBước 2: Cán bộ đối soát dữ liệu với Cơ quan BHXH Quận\nBước 3: Cấp thẻ BHYT điện tử trên ứng dụng VssID và bản thẻ giấy mới',
    conditions: 'Người tham gia BHYT đăng ký thường trú hoặc tạm trú trên địa bàn.',
    legalBasis: 'Luật Bảo hiểm y tế số 25/2008/QH12 sửa đổi 2014',
    requiredDocuments: [
      { id: 401, procedureId: 16, documentName: 'Tờ khai/phiếu đề nghị cấp đổi thẻ BHYT', description: 'Mẫu tờ khai TK1-TS', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 402, procedureId: 16, documentName: 'CCCD/Căn cước của người tham gia BHYT', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 403, procedureId: 16, documentName: 'Thẻ BHYT cũ nếu còn', description: 'Ảnh chụp thẻ BHYT cũ bị rách/hỏng', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 404, procedureId: 16, documentName: 'Giấy tờ chứng minh thông tin thay đổi', description: 'Nếu có thay đổi về đối tượng, mức hưởng', isRequired: false, allowedExtensions: ['.pdf'] }
    ]
  },
  {
    id: 17,
    categoryId: 4,
    categoryName: 'Lao động - TB & Xã hội',
    code: 'TTHC_TROCAPXH_01',
    name: 'Trợ cấp xã hội hàng tháng',
    description: 'Thực hiện chính sách trợ cấp xã hội hàng tháng cho đối tượng bảo trợ xã hội (người cao tuổi, người khuyết tật nặng, trẻ mồ côi).',
    processingTimeDays: 7,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp hồ sơ đề nghị trợ cấp xã hội\nBước 2: Hội đồng xét duyệt trợ cấp xã hội cấp phường họp thẩm định\nBước 3: Chủ tịch UBND ra quyết định hưởng trợ cấp xã hội',
    conditions: 'Thuộc đối tượng bảo trợ xã hội theo Nghị định 20/2021/NĐ-CP.',
    legalBasis: 'Nghị định 20/2021/NĐ-CP của Chính phủ',
    requiredDocuments: [
      { id: 405, procedureId: 17, documentName: 'Tờ khai đề nghị trợ cấp xã hội', description: 'Theo mẫu số 01 ban hành kèm Nghị định 20', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 406, procedureId: 17, documentName: 'CCCD/Căn cước của đối tượng', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 407, procedureId: 17, documentName: 'Giấy tờ chứng minh thuộc đối tượng hưởng', description: 'Giấy xác nhận khuyết tật, trích lục khai tử cha mẹ...', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 408, procedureId: 17, documentName: 'Thông tin tài khoản nhận trợ cấp', description: 'Bản chụp số tài khoản ngân hàng chính chủ', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 18,
    categoryId: 4,
    categoryName: 'Lao động - TB & Xã hội',
    code: 'TTHC_KHUYETTAT_01',
    name: 'Xác định mức độ khuyết tật',
    description: 'Thủ tục đánh giá dạng tật, mức độ khuyết tật và cấp Giấy xác nhận mức độ khuyết tật cho người dân.',
    processingTimeDays: 15,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp đơn đề nghị xác định mức độ khuyết tật\nBước 2: Hội đồng xác định mức độ khuyết tật tổ chức họp đánh giá\nBước 3: Cấp Giấy xác nhận mức độ khuyết tật',
    conditions: 'Người có dấu hiệu khuyết tật đang cư trú tại địa phương.',
    legalBasis: 'Luật Người khuyết tật số 51/2010/QH12',
    requiredDocuments: [
      { id: 409, procedureId: 18, documentName: 'Đơn đề nghị xác định mức độ khuyết tật', description: 'Theo mẫu quy định', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 410, procedureId: 18, documentName: 'CCCD/Căn cước của người đề nghị', description: 'Scan/chụp rõ 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 411, procedureId: 18, documentName: 'Hồ sơ y tế, bệnh án liên quan', description: 'Bản tóm tắt bệnh án, kết luận giám định y khoa nếu có', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 412, procedureId: 18, documentName: 'Giấy ủy quyền thực hiện', description: 'Văn bản ủy quyền nếu người đại diện làm thay', isRequired: false, allowedExtensions: ['.pdf'] }
    ]
  },
  {
    id: 19,
    categoryId: 4,
    categoryName: 'Lao động - TB & Xã hội',
    code: 'TTHC_NGUOICOCONG_01',
    name: 'Trợ cấp đối với đối tượng chính sách/người có công',
    description: 'Thủ tục giải quyết chế độ ưu đãi, trợ cấp một lần hoặc hàng tháng cho người có công và thân nhân người có công với cách mạng.',
    processingTimeDays: 10,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp đơn đề nghị và các giấy tờ minh chứng\nBước 2: Cán bộ LĐ-TB&XH đối chiếu hồ sơ lưu trữ quản lý đối tượng\nBước 3: Ban hành Quyết định hưởng chế độ trợ cấp',
    conditions: 'Là người có công với cách mạng hoặc thân nhân được pháp luật công nhận.',
    legalBasis: 'Pháp lệnh Ưu đãi người có công với cách mạng số 02/2020/UBTVQH14',
    requiredDocuments: [
      { id: 413, procedureId: 19, documentName: 'Đơn đề nghị hưởng chế độ chính sách', description: 'Theo mẫu biểu ban hành', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 414, procedureId: 19, documentName: 'CCCD/Căn cước của người đề nghị', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 415, procedureId: 19, documentName: 'Giấy tờ chứng minh người có công', description: 'Bằng Tổ quốc ghi công, Huân/Huy chương, Giấy chứng nhận thương binh', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 416, procedureId: 19, documentName: 'Giấy tờ chứng minh quan hệ thân nhân', description: 'Giấy khai sinh, Giấy kết hôn hoặc xác nhận cư trú nếu nộp cho thân nhân', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 20,
    categoryId: 4,
    categoryName: 'Lao động - TB & Xã hội',
    code: 'TTHC_MAITANGPHI_01',
    name: 'Hỗ trợ mai táng phí/trợ cấp liên quan',
    description: 'Giải quyết chế độ hỗ trợ chi phí mai táng cho thân nhân khi đối tượng bảo trợ xã hội hoặc người có công từ trần.',
    processingTimeDays: 5,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Thân nhân nộp đơn và Trích lục khai tử\nBước 2: Cán bộ thẩm tra hồ sơ quản lý đối tượng đang hưởng trợ cấp\nBước 3: Chi trả tiền trợ cấp mai táng phí',
    conditions: 'Người mất là đối tượng đang hưởng trợ cấp xã hội hoặc trợ cấp người có công.',
    legalBasis: 'Nghị định 20/2021/NĐ-CP; Nghị định 131/2021/NĐ-CP',
    requiredDocuments: [
      { id: 417, procedureId: 20, documentName: 'Đơn đề nghị hỗ trợ mai táng phí', description: 'Theo mẫu đơn', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 418, procedureId: 20, documentName: 'CCCD/Căn cước của người đề nghị', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 419, procedureId: 20, documentName: 'Giấy chứng tử/Trích lục khai tử', description: 'Bản sao hoặc bản trích lục khai tử của người mất', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 420, procedureId: 20, documentName: 'Giấy tờ chứng minh người mất thuộc đối tượng hưởng', description: 'Sổ trợ cấp hoặc quyết định hưởng trợ cấp trước đây', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },

  // ==========================================
  // 5. CHUNG_THUC – Chứng thực & Sao y
  // ==========================================
  {
    id: 21,
    categoryId: 5,
    categoryName: 'Chứng thực & Sao y',
    code: 'TTHC_CHUNGTHUC_01',
    name: 'Chứng thực bản sao từ bản chính',
    description: 'Chứng thực tính chính xác của bản sao điện tử/bản giấy so với bản chính các giấy tờ, văn bản do cơ quan có thẩm quyền cấp.',
    processingTimeDays: 1,
    feeAmount: 2000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Tải lên bản quét/chụp bản chính giấy tờ gốc đầy đủ các mặt\nBước 2: Cán bộ kiểm tra tính nguyên vẹn và hợp lệ\nBước 3: Ký số cấp Bản sao chứng thực điện tử có mã xác thực QR',
    conditions: 'Bản chính hợp pháp, không bị tẩy xóa, sửa chữa trái pháp luật.',
    legalBasis: 'Nghị định 23/2015/NĐ-CP; Nghị định 45/2020/NĐ-CP',
    requiredDocuments: [
      { id: 501, procedureId: 21, documentName: 'Bản chính giấy tờ cần chứng thực', description: 'Scan/chụp rõ nét đầy đủ các trang/mặt của bản gốc', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 502, procedureId: 21, documentName: 'CCCD/Căn cước của người yêu cầu', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 503, procedureId: 21, documentName: 'Bản sao cần chứng thực', description: 'Bản scan sẵn nếu có', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 22,
    categoryId: 5,
    categoryName: 'Chứng thực & Sao y',
    code: 'TTHC_CHUKY_01',
    name: 'Chứng thực chữ ký',
    description: 'Chứng thực chữ ký của cá nhân trên các văn bản, giấy tờ giao dịch không thuộc diện hợp đồng.',
    processingTimeDays: 1,
    feeAmount: 10000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp dự thảo văn bản cần chứng thực chữ ký\nBước 2: Người yêu cầu ký trước mặt người tiếp nhận hoặc ký số\nBước 3: Xác thực và đóng dấu chứng thực chữ ký',
    conditions: 'Người ký có năng lực hành vi dân sự, nhận thức và làm chủ hành vi.',
    legalBasis: 'Nghị định 23/2015/NĐ-CP của Chính phủ',
    requiredDocuments: [
      { id: 504, procedureId: 22, documentName: 'Văn bản cần chứng thực chữ ký', description: 'Dự thảo văn bản hoàn chỉnh', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 505, procedureId: 22, documentName: 'CCCD/Căn cước của người yêu cầu', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 506, procedureId: 22, documentName: 'Giấy tờ chứng minh nội dung liên quan', description: 'Giấy tờ pháp lý bổ trợ nếu có', isRequired: false, allowedExtensions: ['.pdf'] }
    ]
  },
  {
    id: 23,
    categoryId: 5,
    categoryName: 'Chứng thực & Sao y',
    code: 'TTHC_HOPDONG_01',
    name: 'Chứng thực hợp đồng, giao dịch',
    description: 'Chứng thực các hợp đồng mua bán, chuyển nhượng, tặng cho, thế chấp tài sản thuộc thẩm quyền của UBND cấp xã.',
    processingTimeDays: 2,
    feeAmount: 50000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp hồ sơ và dự thảo hợp đồng giao dịch\nBước 2: Công chức Tư pháp kiểm tra tư cách chủ thể và tính pháp lý tài sản\nBước 3: Các bên ký hợp đồng và nhận bản chứng thực',
    conditions: 'Các bên tham gia giao dịch tự nguyện, tài sản hợp pháp không bị kê biên.',
    legalBasis: 'Nghị định 23/2015/NĐ-CP của Chính phủ',
    requiredDocuments: [
      { id: 507, procedureId: 23, documentName: 'Dự thảo Hợp đồng, giao dịch', description: 'Soạn thảo đầy đủ nội dung điều khoản', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 508, procedureId: 23, documentName: 'CCCD/Căn cước của các bên tham gia', description: 'Scan/chụp 2 mặt của các bên', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 509, procedureId: 23, documentName: 'Giấy chứng nhận quyền sở hữu/sử dụng tài sản', description: 'Sổ đỏ/Sổ hồng hoặc đăng ký xe...', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 510, procedureId: 23, documentName: 'Giấy ủy quyền giao dịch', description: 'Bản ủy quyền công chứng nếu có bên ủy quyền', isRequired: false, allowedExtensions: ['.pdf'] }
    ]
  },
  {
    id: 24,
    categoryId: 5,
    categoryName: 'Chứng thực & Sao y',
    code: 'TTHC_PHANCHIADISAN_01',
    name: 'Chứng thực văn bản thỏa thuận phân chia di sản',
    description: 'Thủ tục chứng thực văn bản thỏa thuận phân chia di sản thừa kế hoặc văn bản khai nhận di sản thừa kế.',
    processingTimeDays: 3,
    feeAmount: 50000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp hồ sơ phân chia di sản và giấy tờ thừa kế\nBước 2: Niêm yết thông báo khai nhận di sản tại UBND phường 15 ngày\nBước 3: Ký chứng thực văn bản phân chia di sản',
    conditions: 'Tất cả các đồng thừa kế tự nguyện thỏa thuận và không có tranh chấp.',
    legalBasis: 'Bộ luật Dân sự 2015; Nghị định 23/2015/NĐ-CP',
    requiredDocuments: [
      { id: 511, procedureId: 24, documentName: 'Văn bản thỏa thuận phân chia di sản', description: 'Dự thảo văn bản thỏa thuận', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 512, procedureId: 24, documentName: 'Giấy chứng tử của người để lại di sản', description: 'Trích lục khai tử của người đã mất', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 513, procedureId: 24, documentName: 'Giấy tờ chứng minh quan hệ thừa kế', description: 'Giấy khai sinh, kết hôn chứng minh hàng thừa kế', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 514, procedureId: 24, documentName: 'Giấy tờ về tài sản/di sản', description: 'Giấy chứng nhận quyền sở hữu tài sản', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 515, procedureId: 24, documentName: 'CCCD/Căn cước của các đồng thừa kế', description: 'Scan/chụp rõ 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 25,
    categoryId: 5,
    categoryName: 'Chứng thực & Sao y',
    code: 'TTHC_UYQUYEN_01',
    name: 'Chứng thực giấy ủy quyền',
    description: 'Chứng thực việc ủy quyền của cá nhân cho người khác thực hiện các công việc, thủ tục hành chính thay mặt mình.',
    processingTimeDays: 1,
    feeAmount: 10000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp dự thảo giấy ủy quyền và giấy tờ nhân thân\nBước 2: Cán bộ kiểm tra phạm vi ủy quyền hợp pháp\nBước 3: Người ủy quyền ký tên và nhận Giấy ủy quyền chứng thực',
    conditions: 'Ủy quyền không có thù lao và không chuyển dịch quyền sở hữu tài sản.',
    legalBasis: 'Nghị định 23/2015/NĐ-CP; Thông tư 01/2020/TT-BTP',
    requiredDocuments: [
      { id: 516, procedureId: 25, documentName: 'Giấy ủy quyền', description: 'Soạn thảo theo mẫu quy định', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 517, procedureId: 25, documentName: 'CCCD/Căn cước của người ủy quyền', description: 'Scan/chụp rõ 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 518, procedureId: 25, documentName: 'CCCD/Căn cước của người được ủy quyền', description: 'Scan/chụp rõ 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 519, procedureId: 25, documentName: 'Giấy tờ chứng minh nội dung ủy quyền', description: 'Giấy tờ liên quan công việc ủy quyền', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },

  // ==========================================
  // 6. KINH_DOANH – Hộ kinh doanh cá thể
  // ==========================================
  {
    id: 26,
    categoryId: 6,
    categoryName: 'Hộ kinh doanh cá thể',
    code: 'TTHC_THANHLAPHOKD_01',
    name: 'Đăng ký thành lập hộ kinh doanh',
    description: 'Thủ tục đăng ký thành lập mới hộ kinh doanh cá thể tại Cơ quan đăng ký kinh doanh cấp huyện/xã.',
    processingTimeDays: 3,
    feeAmount: 100000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp Giấy đề nghị đăng ký hộ kinh doanh trực tuyến\nBước 2: Cơ quan thẩm định tra cứu trùng tên và ngành nghề kinh doanh\nBước 3: Cấp Giấy chứng nhận đăng ký hộ kinh doanh',
    conditions: 'Ngành, nghề đăng ký kinh doanh không thuộc ngành cấm; Tên hộ kinh doanh đúng quy định.',
    legalBasis: 'Nghị định 01/2021/NĐ-CP về đăng ký doanh nghiệp; Thông tư 02/2023/TT-BKHĐT',
    requiredDocuments: [
      { id: 601, procedureId: 26, documentName: 'Giấy đề nghị đăng ký hộ kinh doanh', description: 'Mẫu phụ lục III-1 ban hành kèm Thông tư 02', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 602, procedureId: 26, documentName: 'CCCD/Căn cước của chủ hộ kinh doanh', description: 'Scan/chụp rõ nét 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 603, procedureId: 26, documentName: 'Biên bản họp thành viên hộ gia đình', description: 'Trường hợp các thành viên gia đình cùng đăng ký', isRequired: false, allowedExtensions: ['.pdf'] },
      { id: 604, procedureId: 26, documentName: 'Văn bản ủy quyền làm chủ hộ', description: 'Văn bản ủy quyền cho một thành viên làm chủ hộ', isRequired: false, allowedExtensions: ['.pdf'] },
      { id: 605, procedureId: 26, documentName: 'Giấy ủy quyền nộp hồ sơ', description: 'Nếu người nộp hồ sơ không phải là chủ hộ', isRequired: false, allowedExtensions: ['.pdf'] }
    ]
  },
  {
    id: 27,
    categoryId: 6,
    categoryName: 'Hộ kinh doanh cá thể',
    code: 'TTHC_THAYDOIHOKD_01',
    name: 'Thay đổi nội dung đăng ký hộ kinh doanh',
    description: 'Thủ tục đăng ký thay đổi tên hộ kinh doanh, địa chỉ, ngành nghề kinh doanh, vốn hoặc thông tin chủ hộ.',
    processingTimeDays: 3,
    feeAmount: 50000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp Thông báo thay đổi nội dung đăng ký hộ kinh doanh\nBước 2: Cơ quan đối chiếu thông tin và cập nhật vào Hệ thống thông tin quốc gia\nBước 3: Cấp Giấy chứng nhận đăng ký hộ kinh doanh điều chỉnh',
    conditions: 'Hộ kinh doanh đang hoạt động hợp pháp và thực hiện đầy đủ nghĩa vụ thuế.',
    legalBasis: 'Nghị định 01/2021/NĐ-CP của Chính phủ',
    requiredDocuments: [
      { id: 606, procedureId: 27, documentName: 'Thông báo thay đổi nội dung đăng ký hộ kinh doanh', description: 'Mẫu Phụ lục III-2', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 607, procedureId: 27, documentName: 'CCCD/Căn cước của chủ hộ kinh doanh', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 608, procedureId: 27, documentName: 'Giấy chứng nhận đăng ký hộ kinh doanh cũ', description: 'Bản sao Giấy chứng nhận đã cấp', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 609, procedureId: 27, documentName: 'Giấy tờ chứng minh nội dung thay đổi', description: 'Hợp đồng thuê địa điểm mới, văn bản thỏa thuận...', isRequired: false, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 610, procedureId: 27, documentName: 'Biên bản họp thành viên hộ gia đình', description: 'Nếu các thành viên cùng tham gia', isRequired: false, allowedExtensions: ['.pdf'] }
    ]
  },
  {
    id: 28,
    categoryId: 6,
    categoryName: 'Hộ kinh doanh cá thể',
    code: 'TTHC_TAMNGUNGHOKD_01',
    name: 'Tạm ngừng kinh doanh',
    description: 'Thủ tục thông báo tạm ngừng hoạt động kinh doanh có thời hạn của hộ kinh doanh cá thể.',
    processingTimeDays: 3,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Gửi thông báo tạm ngừng kinh doanh trước ít nhất 03 ngày làm việc\nBước 2: Cơ quan tiếp nhận và cập nhật trạng thái tạm ngừng\nBước 3: Cấp Giấy xác nhận về việc hộ kinh doanh đăng ký tạm ngừng',
    conditions: 'Thời hạn tạm ngừng của mỗi lần thông báo không được quá 01 năm.',
    legalBasis: 'Nghị định 01/2021/NĐ-CP của Chính phủ',
    requiredDocuments: [
      { id: 611, procedureId: 28, documentName: 'Thông báo về việc tạm ngừng kinh doanh', description: 'Mẫu Phụ lục III-4', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 612, procedureId: 28, documentName: 'CCCD/Căn cước của chủ hộ', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 613, procedureId: 28, documentName: 'Giấy ủy quyền thực hiện thủ tục', description: 'Nếu người khác nộp thay', isRequired: false, allowedExtensions: ['.pdf'] }
    ]
  },
  {
    id: 29,
    categoryId: 6,
    categoryName: 'Hộ kinh doanh cá thể',
    code: 'TTHC_CHAMDUTHOKD_01',
    name: 'Chấm dứt hoạt động hộ kinh doanh',
    description: 'Thủ tục thông báo giải thể, chấm dứt hoạt động của hộ kinh doanh cá thể và nộp lại Giấy chứng nhận.',
    processingTimeDays: 3,
    feeAmount: 0,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Hoàn thành nghĩa vụ thuế tại Chi cục Thuế và nộp thông báo chấm dứt\nBước 2: Nộp lại bản gốc Giấy chứng nhận đăng ký hộ kinh doanh\nBước 3: Cơ quan đăng ký xóa tên hộ kinh doanh trong sổ bộ',
    conditions: 'Hộ kinh doanh đã thanh toán đầy đủ các khoản nợ, nghĩa vụ thuế.',
    legalBasis: 'Nghị định 01/2021/NĐ-CP của Chính phủ',
    requiredDocuments: [
      { id: 614, procedureId: 29, documentName: 'Thông báo chấm dứt hoạt động hộ kinh doanh', description: 'Mẫu Phụ lục III-5', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 615, procedureId: 29, documentName: 'Bản gốc Giấy chứng nhận đăng ký hộ kinh doanh', description: 'Scan/chụp bản gốc', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 616, procedureId: 29, documentName: 'Văn bản xác nhận hoàn thành nghĩa vụ thuế', description: 'Do Cơ quan Thuế cấp', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 617, procedureId: 29, documentName: 'CCCD/Căn cước của chủ hộ kinh doanh', description: 'Scan/chụp 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  },
  {
    id: 30,
    categoryId: 6,
    categoryName: 'Hộ kinh doanh cá thể',
    code: 'TTHC_THAYDOICHUHOKD_01',
    name: 'Đăng ký thay đổi chủ hộ kinh doanh',
    description: 'Thủ tục chuyển quyền quản lý, thay đổi người đại diện theo pháp luật / chủ hộ kinh doanh cho cá nhân khác.',
    processingTimeDays: 3,
    feeAmount: 50000,
    active: true,
    submissionMethod: 'Trực tuyến & Trực tiếp',
    implementationSteps: 'Bước 1: Nộp thông báo thay đổi chủ hộ và văn bản chuyển nhượng/tặng cho\nBước 2: Cơ quan thẩm định tính hợp lệ của chủ hộ mới\nBước 3: Cấp Giấy chứng nhận đăng ký hộ kinh doanh ghi nhận chủ hộ mới',
    conditions: 'Chủ hộ kinh doanh mới đáp ứng đầy đủ điều kiện theo quy định.',
    legalBasis: 'Nghị định 01/2021/NĐ-CP của Chính phủ',
    requiredDocuments: [
      { id: 618, procedureId: 30, documentName: 'Thông báo đăng ký thay đổi chủ hộ kinh doanh', description: 'Theo mẫu biểu quy định', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 619, procedureId: 30, documentName: 'Hợp đồng chuyển nhượng/tặng cho hộ kinh doanh', description: 'Hợp đồng hoặc văn bản xác nhận quyền thừa kế', isRequired: true, allowedExtensions: ['.pdf'] },
      { id: 620, procedureId: 30, documentName: 'CCCD/Căn cước của chủ hộ mới', description: 'Scan/chụp rõ nét 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 621, procedureId: 30, documentName: 'CCCD/Căn cước của chủ hộ cũ', description: 'Scan/chụp rõ nét 2 mặt', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { id: 622, procedureId: 30, documentName: 'Bản gốc Giấy chứng nhận đăng ký hộ kinh doanh', description: 'Scan/chụp bản gốc đã cấp', isRequired: true, allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'] }
    ]
  }
];

/**
 * Xác định định dạng tệp cho phép dựa trên tên loại tài liệu
 * Quy tắc: Các loại tài liệu đều được nộp đuôi .pdf, .png, .jpg trừ những loại sau chỉ được đuôi .pdf:
 * Hợp đồng, Đơn/tờ khai, Bản vẽ xây dựng, Văn bản pháp lý
 */
export function getAllowedFileExtensions(docName: string): string[] {
  const lower = (docName || '').toLowerCase();
  if (
    lower.includes('đơn') ||
    lower.includes('tờ khai') ||
    lower.includes('hợp đồng') ||
    lower.includes('bản vẽ') ||
    lower.includes('văn bản') ||
    lower.includes('biên bản') ||
    lower.includes('báo cáo') ||
    lower.includes('dự thảo')
  ) {
    return ['.pdf'];
  }
  return ['.pdf', '.jpg', '.jpeg', '.png'];
}

export function getAllowedFileExtensionsStr(docName: string): string {
  const exts = getAllowedFileExtensions(docName);
  return exts.join(', ');
}
