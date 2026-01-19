import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Users,
  Headphones,
  Award
} from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [openFaq, setOpenFaq] = useState(0);

  const contactInfo = [
    {
      icon: MapPin,
      title: 'ທີ່ຢູ່',
      content: 'ໂພນສະຫວັນ, ເມືອງ ແປກ, ແຂວງຊຽງຂວາງ, ສປປ ລາວ',
      link: null,
      color: '#ef4444'
    },
    {
      icon: Phone,
      title: 'ໂທລະສັບ',
      content: '+856 20 5704771',
      link: 'tel:+856205704771',
      color: '#10b981'
    },
    {
      icon: Mail,
      title: 'ອີເມວ',
      content: 'info@ithubb.com',
      link: 'mailto:info@ithubb.com',
      color: '#3b82f6'
    },
    {
      icon: Clock,
      title: 'ເວລາເຮັດວຽກ',
      content: 'ຈັນ - ເສົາ: 8:00 - 18:00',
      link: null,
      color: '#f59e0b'
    }
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', color: '#1877f2', link: '#' },
    { icon: Instagram, name: 'Instagram', color: '#e4405f', link: '#' },
    { icon: MessageCircle, name: 'WhatsApp', color: '#25d366', link: '#' },
    { icon: MessageCircle, name: 'Line', color: '#00b900', link: '#' }
  ];

  const stats = [
    { icon: Users, value: '5000+', label: 'ລູກຄ້າທີ່ໄວ້ວາງໃຈ' },
    { icon: Headphones, value: '24/7', label: 'ການສະຫນັບສະຫນູນ' },
    { icon: Award, value: '100%', label: 'ຄວາມພໍໃຈ' }
  ];

  const faqs = [
    {
      question: 'ເວລາເຮັດວຽກຂອງພວກເຮົາແມ່ນແນວໃດ?',
      answer: 'ພວກເຮົາເປີດໃຫ້ບໍລິການທຸກວັນຈັນ - ເສົາ ເວລາ 8:00 - 18:00 ນ. ສຳລັບວັນອາທິດ ແລະ ວັນພັກຕ່າງໆ ກະລຸນາກວດສອບກັບພວກເຮົາກ່ອນ.'
    },
    {
      question: 'ຈະຕິດຕໍ່ແນວໃດ ຖ້າມີບັນຫາກັບສິນຄ້າ?',
      answer: 'ທ່ານສາມາດຕິດຕໍ່ພວກເຮົາໄດ້ທາງໂທລະສັບ, ອີເມວ, ຫຼື ຜ່ານແບບຟອມຂ້າງເທິງນີ້. ທີມງານຂອງພວກເຮົາຈະຕອບກັບໃນໄວທີ່ສຸດ.'
    },
    {
      question: 'ມີການຮັບປະກັນສິນຄ້າບໍ?',
      answer: 'ສິນຄ້າທຸກຊະນິດມີການຮັບປະກັນຕາມທີ່ຜູ້ຜະລິດກຳນົດ. ສຳລັບລາຍລະອຽດເພີ່ມເຕີມ ກະລຸນາສອບຖາມກັບທີມງານຂອງພວກເຮົາ.'
    },
    {
      question: 'ມີການຈັດສົ່ງສິນຄ້າບໍ?',
      answer: 'ພວກເຮົາມີບໍລິການຈັດສົ່ງທົ່ວປະເທດ. ຄ່າຈັດສົ່ງຂຶ້ນກັບທີ່ຕັ້ງ ແລະ ນໍ້າໜັກຂອງສິນຄ້າ. ກະລຸນາຕິດຕໍ່ສອບຖາມລາຄາ.'
    }
  ];

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'ກະລຸນາປ້ອນອີເມວທີ່ຖືກຕ້ອງ';
        }
        break;
      case 'phone':
        if (value && !/^[0-9+\s-]{8,}$/.test(value)) {
          return 'ກະລຸນາປ້ອນເບີໂທລະສັບທີ່ຖືກຕ້ອງ';
        }
        break;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);

    setTimeout(() => {
      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);

      setTimeout(() => setShowSuccess(false), 5000);
    }, 1500);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="hero-content">
          <h1 className="hero-title">ຕິດຕໍ່ພວກເຮົາ</h1>
          <p className="hero-subtitle">
            ພວກເຮົາພ້ອມໃຫ້ບໍລິການ ແລະ ຕອບຄຳຖາມທຸກຂໍ້ສົງໃສຂອງທ່ານ
          </p>
        </div>
      </section>

      <div className="contact-content">
        <div className="stats-section">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card">
                <div className="stat-icon">
                  <Icon size={28} />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="content-grid">
          <div className="info-card">
            <h2 className="info-title">
              <Mail size={24} />
              <span>ຂໍ້ມູນຕິດຕໍ່</span>
            </h2>

            <div className="info-list">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="info-item">
                    <div className="info-icon" style={{ backgroundColor: `${item.color}15` }}>
                      <Icon size={24} style={{ color: item.color }} />
                    </div>
                    <div className="info-details">
                      <div className="info-label">{item.title}</div>
                      <div className="info-text">
                        {item.link ? (
                          <a href={item.link} className="info-link">{item.content}</a>
                        ) : (
                          item.content
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="divider"></div>

            <h3 className="social-title">ຕິດຕາມພວກເຮົາ</h3>
            <div className="social-links">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.link}
                    className="social-btn"
                    style={{ borderColor: `${social.color}40` }}
                  >
                    <div className="social-icon" style={{ backgroundColor: `${social.color}15` }}>
                      <Icon size={20} style={{ color: social.color }} />
                    </div>
                    <span>{social.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="form-card">
            <h2 className="form-title">ສົ່ງຂໍ້ຄວາມຫາພວກເຮົາ</h2>

            {showSuccess && (
              <div className="success-message">
                <CheckCircle2 size={20} />
                <span>ສົ່ງຂໍ້ຄວາມສຳເລັດ! ພວກເຮົາຈະຕິດຕໍ່ກັບທ່ານໃນໄວໆນີ້</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    ຊື່ຂອງທ່ານ<span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="ປ້ອນຊື່ຂອງທ່ານ"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    ອີເມວ<span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">ເບີໂທລະສັບ</label>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+856 20 XXXX XXXX"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    ຫົວຂໍ້<span className="required">*</span>
                  </label>
                  <select
                    name="subject"
                    className="form-select"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">ເລືອກຫົວຂໍ້</option>
                    <option value="general">ສອບຖາມທົ່ວໄປ</option>
                    <option value="product">ສອບຖາມສິນຄ້າ</option>
                    <option value="order">ສອບຖາມອໍເດີ</option>
                    <option value="support">ຊ່ວຍເຫຼືອດ້ານເທັກນິກ</option>
                    <option value="other">ອື່ນໆ</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  ຂໍ້ຄວາມ<span className="required">*</span>
                </label>
                <textarea
                  name="message"
                  className="form-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="ເຂົ້າຂໍ້ຄວາມຂອງທ່ານ..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    <span>ກຳລັງສົ່ງ...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>ສົ່ງຂໍ້ຄວາມ</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="map-section">
          <h2 className="map-title">ແຜນທີ່ຕັ້ງຂອງພວກເຮົາ</h2>
          <div className="map-wrapper">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3872.2394859615465!2d103.2037906639804!3d19.455378387444224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sth!2sla!4v1766043171934!5m2!1sth!2sla"
                width="100%"
                height="450"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="IT HUBB Location"
              />
            </div>
            <a
              href="https://maps.app.goo.gl/Csui3b2heX8YUFwR6"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-google-maps"
            >
              <MapPin size={20} />
              <span>ນຳທາງດ້ວຍ Google Maps</span>
            </a>
          </div>
        </div>

        <div className="faq-section">
          <h2 className="faq-title">ຄຳຖາມທີ່ພົບເລື້ອຍ</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openFaq === index ? 'active' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={`faq-icon ${openFaq === index ? 'rotated' : ''}`}
                  />
                </div>
                <div className={`faq-answer ${openFaq === index ? 'open' : ''}`}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
