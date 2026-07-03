import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 text-center md:text-right">
          {/* Site Description */}
          <div>
            <h3 className="german-text text-2xl font-black mb-4 text-blue-400">Hallo Deutsch</h3>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base max-w-sm mx-auto md:mx-0">
              دليلك الشامل لتعلّم اللغة الألمانية من الصفر حتى الاحتراف. نوفر دروساً مبسطة ومنظمة، تمارين تفاعلية، ونماذج امتحانات رسمية لجميع المستويات.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-400">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-blue-400 transition-colors block py-1">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/levels" className="text-gray-300 hover:text-blue-400 transition-colors block py-1">
                  المستويات
                </Link>
              </li>
              <li>
                <Link to="/vocabulary" className="text-gray-300 hover:text-blue-400 transition-colors block py-1">
                  المفردات
                </Link>
              </li>
              <li>
                <Link to="/grammar" className="text-gray-300 hover:text-blue-400 transition-colors block py-1">
                  القواعد
                </Link>
              </li>
              <li>
                <Link to="/exercises" className="text-gray-300 hover:text-blue-400 transition-colors block py-1">
                  التمارين
                </Link>
              </li>
              <li>
                <Link to="/placement-test" className="text-gray-300 hover:text-blue-400 transition-colors block py-1">
                  اختبار تحديد المستوى
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-400">تواصل معنا</h3>
            <p className="text-gray-400 leading-relaxed mb-4 text-sm md:text-base">
              لأي استفسارات أو اقتراحات، نحن هنا لمساعدتك في رحلتك لتعلم اللغة الألمانية.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
                {/* Social icons could go here */}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} <span className="german-text">Hallo Deutsch</span>. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;