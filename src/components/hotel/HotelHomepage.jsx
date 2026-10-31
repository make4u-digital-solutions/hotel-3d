"use client";

/**
 * HotelHomepage Component
 *
 * Master orchestrator for the 12 luxury hotel homepage sections rendered below the animated hero:
 * Section 1 — Hotel introduction
 * Section 2 — Rooms & Suites
 * Section 3 — About the Hotel
 * Section 4 — Hotel Amenities
 * Section 5 — Dining Experience
 * Section 6 — Experiences
 * Section 7 — Hotel Gallery
 * Section 8 — Testimonials
 * Section 9 — Location and Contact
 * Section 10 — Frequently Asked Questions
 * Section 11 — Final booking CTA
 * Section 12 — Footer
 *
 * Adheres strictly to the 70% desktop width container specification.
 */

import { memo } from "react";
import HotelIntroduction from "./sections/HotelIntroduction";
import RoomsAndSuites from "./sections/RoomsAndSuites";
import AboutHotel from "./sections/AboutHotel";
import HotelAmenities from "./sections/HotelAmenities";
import DiningExperience from "./sections/DiningExperience";
import HotelExperiences from "./sections/HotelExperiences";
import HotelGallery from "./sections/HotelGallery";
import Testimonials from "./sections/Testimonials";
import LocationContact from "./sections/LocationContact";
import HotelFAQ from "./sections/HotelFAQ";
import FinalBookingCTA from "./sections/FinalBookingCTA";
import HotelFooter from "./sections/HotelFooter";

function HotelHomepage({ onBookClick, onViewSuiteDetails }) {
  return (
    <div className="w-full relative z-20 bg-[#FAF8F5]">
      {/* Section 1 — Hotel Introduction */}
      <HotelIntroduction />

      {/* Section 2 — Rooms & Suites */}
      <RoomsAndSuites
        onBookSuite={onBookClick}
        onViewDetails={onViewSuiteDetails}
      />

      {/* Section 3 — About the Hotel */}
      <AboutHotel />

      {/* Section 4 — Hotel Amenities */}
      <HotelAmenities />

      {/* Section 5 — Dining Experience */}
      <DiningExperience />

      {/* Section 6 — Experiences */}
      <HotelExperiences
        onInquireExperience={onBookClick}
      />

      {/* Section 7 — Hotel Gallery */}
      <HotelGallery />

      {/* Section 8 — Testimonials */}
      <Testimonials />

      {/* Section 9 — Location and Contact */}
      <LocationContact />

      {/* Section 10 — Frequently Asked Questions */}
      <HotelFAQ />

      {/* Section 11 — Final booking CTA */}
      <FinalBookingCTA onBookClick={onBookClick} />

      {/* Section 12 — Footer */}
      <HotelFooter onBookClick={onBookClick} />
    </div>
  );
}

export default memo(HotelHomepage);
