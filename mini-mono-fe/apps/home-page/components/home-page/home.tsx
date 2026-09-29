// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { isMobile, isApp } from '@better-bit-fe/base-utils';
import { HomeData, Safety, Download, Journey, Banner, ContentSwiper, Global, ActivityModal, CopyTrading, Products, Faq, Partner, Admodal } from './index';
import { LangSwitchBanner } from './langSwitchBanner';
import AnimatedSection from './AnimatedSection';

function PCHomePage({ colorPreference }) {
  const { userInfo } = useUserInfo();
  const isMb = isMobile()
  return (
    <div>
      {/* <LangSwitchBanner /> */}
      <Banner />
      <AnimatedSection delay={100}>
        <ContentSwiper />
      </AnimatedSection>
      <AnimatedSection delay={500}>
        <HomeData />
      </AnimatedSection>
      <AnimatedSection delay={700}>
        <CopyTrading />
      </AnimatedSection>
      <AnimatedSection delay={900}>
        <Products />
      </AnimatedSection>
      <AnimatedSection delay={1100}>
        <Safety />
      </AnimatedSection>
      <AnimatedSection delay={1300}>
        <Download />
      </AnimatedSection>
      <AnimatedSection delay={1500}>
        <Faq />
      </AnimatedSection>
      <AnimatedSection delay={1700}>
        <Partner />
      </AnimatedSection>
      {/* <ActivityModal /> */}
      <Admodal />
      {!userInfo && <Journey />}
    </div>
  );
}

export default PCHomePage;
