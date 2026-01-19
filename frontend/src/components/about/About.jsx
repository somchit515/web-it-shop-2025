import React from 'react';
import MetaData from '../layout/MetaData';
import './About.css';

const About = () => {
  const stats = [
    { number: '10,000+', label: 'ລູກຄ້າທີ່ໄວ້ວາງໃຈ', icon: '👥' },
    { number: '50,000+', label: 'ສິນຄ້າທີ່ຈຳໜ່າຍ', icon: '📦' },
    { number: '99.9%', label: 'ຄວາມພໍໃຈຂອງລູກຄ້າ', icon: '⭐' },
    { number: '24/7', label: 'ບໍລິການສະໜັບສະໜູນ', icon: '🎧' }
  ];

  const values = [
    {
      icon: '🎯',
      title: 'ຄຸນນະພາບເປັນເລີດ',
      description: 'ພວກເຮົາມຸ່ງໝັ້ນໃນການສະໜອງສິນຄ້າທີ່ມີຄຸນນະພາບສູງສຸດ'
    },
    {
      icon: '🚀',
      title: 'ການຈັດສົ່ງລວດໄວ',
      description: 'ສົ່ງສິນຄ້າໄວ ແລະ ປອດໄພທົ່ວປະເທດລາວ'
    },
    {
      icon: '💎',
      title: 'ລາຄາຍຸດຕິທຳ',
      description: 'ລາຄາທີ່ແຂ່ງຂັນ ພ້ອມໂປຣໂມຊັນພິເສດຕະຫຼອດປີ'
    },
    {
      icon: '🤝',
      title: 'ບໍລິການດີເລີດ',
      description: 'ທີມງານມືອາຊີບພ້ອມໃຫ້ບໍລິການທຸກເມື່ອ'
    }
  ];

  const team = [
    {
      name: 'ທ່ານ ສຸກວິສອນ ສີປະມວນ',
      role: 'CEO & Founder',
      image: '👨‍💼',
      description: 'ຜູ້ນຳທີ່ມີວິໄສທັດ'
    },
    {
      name: 'ທ່ານ ພຸດທະສອນ ໄຊຍະເສນາ',
      role: 'CTO',
      image: '👩‍💻',
      description: 'ຜູ້ຊ່ຽວຊານດ້ານເທັກໂນໂລຢີ'
    },
    {
      name: 'ທ່ານ ບຸນມີ',
      role: 'Head of Operations',
      image: '👨‍💼',
      description: 'ຜູ້ຈັດການການດຳເນີນງານ'
    },
    {
      name: 'ນາງ ດາລາ',
      role: 'Customer Success',
      image: '👩‍💼',
      description: 'ຜູ້ດູແລຄວາມພໍໃຈລູກຄ້າ'
    }
  ];

  return (
    <>
      
      <MetaData title="About Us - IT HUBB" />

      <div className="about-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">ກ່ຽວກັບພວກເຮົາ</h1>
            <p className="hero-subtitle">
              ພວກເຮົາແມ່ນຮ້ານຄ້າອອນລາຍທີ່ນຳສະເໜີສິນຄ້າເທັກໂນໂລຢີຊັ້ນນຳ
              ດ້ວຍຄວາມມຸ່ງໝັ້ນໃນການໃຫ້ບໍລິການທີ່ດີທີ່ສຸດແກ່ລູກຄ້າທຸກທ່ານ
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="story-section">
          <div className="story-container">
            <h2 className="section-title">ເລື່ອງລາວຂອງພວກເຮົາ</h2>
            <p className="section-subtitle">ການເດີນທາງສູ່ຄວາມສຳເລັດ</p>
            
            <div className="story-content">
              <div className="story-text">
                <p>
                  ກ່ອຕັ້ງຂຶ້ນໃນປີ 2020, IT HUBB ເລີ່ມຕົ້ນດ້ວຍຄວາມຝັນທີ່ຈະນຳເອົາ
                  ເທັກໂນໂລຢີທີ່ທັນສະໄໝມາສູ່ປະຊາຊົນລາວທຸກຄົນ.
                </p>
                <p>
                  ດ້ວຍທີມງານທີ່ມີປະສົບການ ແລະ ຄວາມມຸ່ງໝັ້ນ, 
                  ພວກເຮົາໄດ້ເຕີບໃຫຍ່ຂຶ້ນຈາກຮ້ານເລັກໆ ໜຶ່ງສູ່ການເປັນ
                  ຜູ້ນຳດ້ານການຈຳໜ່າຍສິນຄ້າເທັກໂນໂລຢີໃນປະເທດລາວ.
                </p>
                <p>
                  ວັນນີ້, ພວກເຮົາພູມໃຈທີ່ໄດ້ໃຫ້ບໍລິການລູກຄ້າກວ່າ 10,000 ທ່ານ
                  ແລະ ຍັງສືບຕໍ່ພັດທະນາເພື່ອໃຫ້ບໍລິການທີ່ດີທີ່ສຸດ.
                </p>
              </div>
              <div className="story-image">
                🏢
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <div className="story-container">
            <h2 className="section-title">ຄຸນຄ່າຂອງພວກເຮົາ</h2>
            <p className="section-subtitle">ສິ່ງທີ່ພວກເຮົາເຊື່ອ ແລະ ປະຕິບັດ</p>
          </div>
          
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="story-container">
            <h2 className="section-title">ພົບກັບທີມງານ</h2>
            <p className="section-subtitle">ຜູ້ທີ່ຢູ່ເບື້ອງຫຼັງຄວາມສຳເລັດຂອງພວກເຮົາ</p>
          </div>
          
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image">{member.image}</div>
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">ພ້ອມທີ່ຈະເລີ່ມຕົ້ນແລ້ວບໍ?</h2>
            <p className="cta-description">
              ສຳຫຼວດສິນຄ້າຫຼາກຫຼາຍຂອງພວກເຮົາ ແລະ ຊອບປິ້ງດ້ວຍຄວາມໝັ້ນໃຈ
            </p>
            <div className="cta-buttons">
              <a href="/" className="btn-primary">
                <i className="fas fa-shopping-bag"></i> ເລີ່ມຊອບປິ້ງ
              </a>
              <a href="/contact" className="btn-secondary">
                <i className="fas fa-phone"></i> ຕິດຕໍ່ພວກເຮົາ
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;