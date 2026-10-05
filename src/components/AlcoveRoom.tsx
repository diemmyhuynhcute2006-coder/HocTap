import React from 'react';
import { CharacterState, RoomCustomization } from '../types';
import { ChibiCharacter } from './ChibiCharacter';
import { VirtualPet } from './VirtualPet';

interface AlcoveRoomProps {
  characterState: CharacterState;
  roomSetup: RoomCustomization;
  showCharacter?: boolean;
  showPet?: boolean;
  onToggleLamp?: () => void;
  onSlotClick?: (slot: 'desk' | 'wall' | 'floor' | 'window' | 'pet') => void;
  isFocusModeActive?: boolean;
}

export const AlcoveRoom: React.FC<AlcoveRoomProps> = ({
  characterState,
  roomSetup,
  showCharacter = true,
  showPet = true,
  onToggleLamp,
  onSlotClick,
  isFocusModeActive = false,
}) => {
  const { deskItem, wallItem, floorItem, petItem, windowView, lampOn } = roomSetup;

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[16/10] sm:aspect-[16/9] min-h-[380px] max-h-[560px] rounded-3xl overflow-hidden shadow-2xl border border-amber-900/10 dark:border-stone-800 bg-stone-900 select-none">
      {/* ============================================================== */}
      {/* 1. ROOM BACKGROUND: WALLS & HARDWOOD FLOOR                      */}
      {/* ============================================================== */}
      {/* Back Wall with Soft Cozy Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F7EFE5] via-[#EFE6DC] to-[#E3D6C8] dark:from-[#292524] dark:via-[#1C1917] dark:to-[#0C0A09] transition-colors duration-700" />

      {/* Wall Baseboard Molding */}
      <div className="absolute top-[68%] left-0 right-0 h-4 bg-[#C5B3A1] dark:bg-[#2E2825] border-t border-[#A89684] dark:border-[#3F3733]" />

      {/* Hardwood Parquet Floor */}
      <div className="absolute top-[70%] inset-x-0 bottom-0 bg-gradient-to-b from-[#D4A373] via-[#BC8A5F] to-[#A47148] dark:from-[#443831] dark:to-[#2B231E]">
        {/* Wood Floor Planks Lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_60px,#5B3A1E_61px)]" />
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_30px,#5B3A1E_31px)]" />
      </div>

      {/* ============================================================== */}
      {/* 2. ARCHED WINDOW WITH DYNAMIC SEASON/WEATHER VIEW              */}
      {/* ============================================================== */}
      <div
        onClick={() => onSlotClick?.('window')}
        className="group absolute top-6 left-[6%] w-[26%] max-w-[210px] aspect-[3/4] rounded-t-full rounded-b-lg border-4 border-[#8B5E3C] dark:border-[#4A3728] shadow-inner overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
        title="Bấm để đổi khung cảnh cửa sổ"
      >
        {/* Sky / Outdoor Background by Window Type */}
        {windowView === 'rainy' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-600 via-slate-500 to-slate-400">
            {/* Distant Hills / Trees */}
            <div className="absolute bottom-0 inset-x-0 h-10 bg-slate-700/60 rounded-t-full" />
            {/* Rain Streaks */}
            <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(-35deg,transparent,transparent_8px,#E2E8F0_9px,#E2E8F0_10px)] animate-soft-pulse" />
            {/* Window Glass Raindrops */}
            <div className="absolute top-8 left-4 w-1.5 h-3 bg-white/70 rounded-full shadow-sm" />
            <div className="absolute top-16 left-12 w-2 h-4 bg-white/60 rounded-full shadow-sm" />
            <div className="absolute top-24 left-6 w-1 h-3 bg-white/70 rounded-full" />
          </div>
        )}

        {windowView === 'sakura' && (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-pink-100 to-pink-200">
            {/* Mt Fuji or Green Hill in Distance */}
            <div className="absolute -bottom-2 -left-4 w-32 h-16 bg-emerald-600/30 rounded-t-full" />
            {/* Cherry Blossom Branch */}
            <path d="" />
            {/* Sakura Petals drifting */}
            <div className="absolute top-4 left-6 text-pink-500 text-xs animate-gentle-float">🌸</div>
            <div className="absolute top-14 left-16 text-pink-400 text-sm animate-gentle-sway">🌸</div>
            <div className="absolute top-24 left-4 text-pink-400 text-xs animate-gentle-float">🌸</div>
            <div className="absolute top-8 right-4 text-pink-300 text-xs animate-gentle-sway">🌸</div>
          </div>
        )}

        {windowView === 'autumn' && (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500 via-orange-400 to-rose-400">
            {/* Golden Sunset */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-amber-100 rounded-full blur-[1px] opacity-80" />
            {/* Autumn Leaves floating */}
            <div className="absolute top-8 left-4 text-amber-900 text-xs animate-gentle-sway">🍂</div>
            <div className="absolute top-20 right-6 text-orange-900 text-xs animate-gentle-float">🍁</div>
          </div>
        )}

        {windowView === 'winter' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-indigo-900 to-slate-900">
            {/* Moon & Snow Pines */}
            <div className="absolute top-4 right-4 w-6 h-6 bg-amber-50 rounded-full shadow-[0_0_12px_#FEF08A]" />
            <div className="absolute bottom-0 inset-x-0 h-10 bg-slate-100 rounded-t-3xl" />
            {/* Snowflakes */}
            <div className="absolute top-8 left-4 text-white text-xs animate-gentle-float">❄️</div>
            <div className="absolute top-18 right-8 text-white text-sm animate-gentle-sway">❄️</div>
            <div className="absolute top-28 left-10 text-white text-xs animate-gentle-float">❄️</div>
          </div>
        )}

        {windowView === 'halloween' && (
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-indigo-950 to-stone-900">
            {/* Giant Spooky Moon */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-amber-400 rounded-full shadow-[0_0_20px_#F59E0B]" />
            <div className="absolute top-12 left-6 text-stone-900 text-xs">🦇</div>
            <div className="absolute top-16 right-5 text-stone-900 text-xs">🦇</div>
          </div>
        )}

        {(windowView === 'sunny' || !windowView) && (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-200">
            {/* Sun Glow */}
            <div className="absolute top-4 right-6 w-10 h-10 bg-amber-100 rounded-full blur-[2px] opacity-90 shadow-[0_0_15px_#FDE047]" />
            {/* Drifting Clouds */}
            <div className="absolute top-10 left-3 w-14 h-5 bg-white/80 rounded-full blur-[0.5px] animate-gentle-float" />
            <div className="absolute top-18 right-4 w-12 h-4 bg-white/70 rounded-full blur-[0.5px] animate-gentle-float" />
            {/* Green Hills */}
            <div className="absolute -bottom-2 inset-x-0 h-10 bg-emerald-500 rounded-t-3xl" />
          </div>
        )}

        {/* Window Wood Grids & Sill */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical divider */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 bg-[#8B5E3C] dark:bg-[#4A3728]" />
          {/* Horizontal divider */}
          <div className="absolute top-[52%] inset-x-0 -translate-y-1/2 h-2 bg-[#8B5E3C] dark:bg-[#4A3728]" />
        </div>

        {/* Window Sill */}
        <div className="absolute bottom-0 inset-x-0 h-3 bg-[#A47148] dark:bg-[#5C4033] border-t border-[#C59B76] shadow-sm" />

        {/* Cozy Curtains */}
        <div className="absolute top-0 left-0 w-4 bottom-3 bg-gradient-to-r from-amber-100/90 to-transparent dark:from-stone-700/80 rounded-l" />
        <div className="absolute top-0 right-0 w-4 bottom-3 bg-gradient-to-l from-amber-100/90 to-transparent dark:from-stone-700/80 rounded-r" />
      </div>

      {/* ============================================================== */}
      {/* 3. WALL DECORATIONS (FAIRY LIGHTS, ART FRAME, CALENDAR, MOON)  */}
      {/* ============================================================== */}
      {/* Fairy Lights across top wall */}
      {wallItem === 'wall_string_lights' && (
        <div className="absolute top-2 inset-x-4 flex justify-between items-center pointer-events-none z-10">
          <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 30">
            <path d="M 0,5 Q 100,25 200,8 Q 300,25 400,5" fill="none" stroke="#78716C" strokeWidth="1" strokeDasharray="3,1" />
            {[40, 90, 150, 210, 270, 330, 380].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={12 + (i % 2 === 0 ? 5 : 0)}
                r="4.5"
                fill="#FEF08A"
                className="animate-soft-pulse"
                style={{ filter: 'drop-shadow(0 0 6px #FBBF24)' }}
              />
            ))}
          </svg>
        </div>
      )}

      {/* Wall Frame / Art Slot */}
      <div
        onClick={() => onSlotClick?.('wall')}
        className="group absolute top-8 right-[24%] w-16 sm:w-20 aspect-[3/4] bg-stone-100 dark:bg-stone-800 border-4 border-[#8B5E3C] dark:border-[#5C4033] rounded-sm shadow-md cursor-pointer hover:scale-105 transition-transform flex items-center justify-center p-1.5"
        title="Trang trí tranh tường"
      >
        {wallItem === 'wall_art_botanical' ? (
          <div className="w-full h-full bg-[#FFFBEB] flex flex-col items-center justify-center border border-amber-200">
            <span className="text-xl sm:text-2xl">🌿</span>
            <span className="text-[7px] text-stone-500 font-serif">Botanical</span>
          </div>
        ) : wallItem === 'wall_polaroids' ? (
          <div className="w-full h-full bg-white flex flex-col items-center justify-between p-1">
            <div className="w-full h-3/4 bg-amber-100 rounded-sm flex items-center justify-center text-xs">📷</div>
            <span className="text-[6px] text-stone-400 font-mono">MEMORIES</span>
          </div>
        ) : wallItem === 'wall_moon_canvas' ? (
          <div className="w-full h-full bg-slate-900 rounded-sm flex items-center justify-center border border-slate-700">
            <span className="text-xl text-amber-300 drop-shadow-[0_0_6px_#FDE047]">🌙</span>
          </div>
        ) : (
          /* Default Wall Art: Minimalist Plant Print */
          <div className="w-full h-full bg-[#FAF5EF] dark:bg-stone-700 flex flex-col items-center justify-center border border-dashed border-stone-300 dark:border-stone-600">
            <span className="text-base sm:text-xl opacity-70">🌱</span>
            <span className="text-[7px] text-stone-400 mt-0.5">My Alcove</span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 4. BOOKSHELF & CABINET (RIGHT WALL)                             */}
      {/* ============================================================== */}
      <div className="absolute top-[32%] right-[4%] w-[16%] max-w-[130px] h-[48%] bg-[#9C6644] dark:bg-[#4E3424] border-2 border-[#7F5539] rounded-md shadow-lg flex flex-col justify-between p-1.5 z-10">
        {/* Shelf 1: Colorful Books + Trinket */}
        <div className="w-full h-[28%] border-b-4 border-[#7F5539] flex items-end justify-start gap-1 pb-0.5">
          <div className="w-2.5 h-10 bg-rose-500 rounded-t-sm shadow-sm" />
          <div className="w-3 h-12 bg-sky-600 rounded-t-sm shadow-sm" />
          <div className="w-2 h-9 bg-emerald-600 rounded-t-sm shadow-sm" />
          <div className="w-3.5 h-11 bg-amber-500 rounded-t-sm shadow-sm" />
          {roomSetup.shelfItem === 'shelf_crystal' && (
            <span className="text-xs ml-auto mb-1 animate-gentle-float" title="Pha lê">🔮</span>
          )}
        </div>

        {/* Shelf 2: Cactus / Mini Succulent + Clock */}
        <div className="w-full h-[32%] border-b-4 border-[#7F5539] flex items-end justify-between px-1 pb-0.5">
          <div className="w-3.5 h-4 bg-stone-300 border border-stone-400 rounded-t-sm" />
          <div className="w-5 h-7 bg-amber-200 border border-amber-400 rounded-md flex items-center justify-center text-[7px] font-bold text-amber-900">
            10:10
          </div>
        </div>

        {/* Shelf 3: Cabinet Closed Doors */}
        <div className="w-full h-[32%] bg-[#7F5539] dark:bg-[#3D281C] rounded-sm flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-200/80 shadow-xs" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-200/80 shadow-xs" />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. COZY DAYBED WITH BLANKET & CUSHIONS (LEFT BACKGROUND)       */}
      {/* ============================================================== */}
      <div className="absolute top-[52%] left-[4%] w-[32%] max-w-[250px] h-[32%] z-10 pointer-events-none">
        {/* Bed Wooden Frame */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-[#8B5E3C] dark:bg-[#4A3728] rounded-t-md shadow-md">
          {/* Wooden Bed Legs */}
          <div className="absolute -bottom-3 left-2 w-3 h-3 bg-[#5C4033] rounded-b-xs" />
          <div className="absolute -bottom-3 right-2 w-3 h-3 bg-[#5C4033] rounded-b-xs" />
        </div>

        {/* Soft Mattress with Pastel Quilt */}
        <div className="absolute bottom-4 inset-x-1 h-14 bg-gradient-to-r from-[#EDE9FE] to-[#FCE7F3] dark:from-stone-700 dark:to-stone-800 rounded-t-lg shadow-inner border-t-2 border-white/60">
          {/* Quilt Texture / Stitching */}
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#C084FC_9px)]" />

          {/* Fluffy Pillows */}
          <div className="absolute -top-3 left-2 w-12 h-7 bg-white dark:bg-stone-600 rounded-full shadow-sm -rotate-6 border border-stone-200 dark:border-stone-500" />
          <div className="absolute -top-3 left-10 w-11 h-7 bg-pink-100 dark:bg-stone-600 rounded-full shadow-sm rotate-3 border border-pink-200 dark:border-stone-500" />

          {/* Plush Teddy / Cushion */}
          <div className="absolute -top-1 left-22 text-base">🧸</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. FLOOR CARPET / RUG                                          */}
      {/* ============================================================== */}
      <div
        onClick={() => onSlotClick?.('floor')}
        className="absolute top-[72%] left-[30%] w-[38%] max-w-[300px] h-[22%] rounded-[40%] bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 border-2 border-dashed border-amber-300/80 dark:border-stone-600 shadow-md cursor-pointer hover:border-amber-400 transition-colors z-10 flex items-center justify-center"
        title="Thảm dệt sàn phòng"
      >
        {floorItem === 'floor_rug_boho' ? (
          <div className="w-[90%] h-[75%] rounded-[40%] border border-rose-300 bg-[repeating-linear-gradient(90deg,#FFE4E6,#FFE4E6_8px,#FCE7F3_8px,#FCE7F3_16px)] flex items-center justify-center">
            <span className="text-[9px] text-rose-700/60 font-mono tracking-widest">BOHO COZY</span>
          </div>
        ) : (
          <div className="w-[85%] h-[70%] rounded-[40%] border border-stone-200 dark:border-stone-600 bg-amber-50/50 dark:bg-stone-800/50" />
        )}
      </div>

      {/* Floor Plant Slot (Monstera or Snake Plant) */}
      <div
        onClick={() => onSlotClick?.('floor')}
        className="absolute top-[60%] left-[2%] w-14 sm:w-16 aspect-square z-20 cursor-pointer hover:scale-110 transition-transform"
        title="Chậu cây đặt sàn"
      >
        {deskItem === 'plant_snake' || floorItem === 'plant_snake' ? (
          <div className="flex flex-col items-center">
            <div className="text-3xl sm:text-4xl animate-gentle-sway">🌿</div>
            <div className="w-8 h-6 bg-[#C27D56] rounded-b-md border-t-2 border-[#A8643E] shadow-sm -mt-2" />
          </div>
        ) : deskItem === 'plant_monstera' || floorItem === 'plant_monstera' ? (
          <div className="flex flex-col items-center">
            <div className="text-3xl sm:text-4xl animate-gentle-breath">🌱</div>
            <div className="w-9 h-7 bg-[#B86539] rounded-b-md border-t-2 border-[#964B24] shadow-sm -mt-2" />
          </div>
        ) : null}
      </div>

      {/* ============================================================== */}
      {/* 7. STUDY WORK DESK & CHAIR (RIGHT-CENTER)                      */}
      {/* ============================================================== */}
      <div className="absolute top-[52%] right-[18%] w-[38%] max-w-[290px] h-[36%] z-20">
        {/* Ergonomic Study Chair Behind Desk */}
        <div className="absolute -top-6 left-12 w-14 h-18 bg-[#6B4423] dark:bg-[#3E2718] rounded-t-2xl shadow-sm border border-[#523318]">
          <div className="w-10 h-10 mx-auto mt-2 bg-[#A47148] dark:bg-[#5C4033] rounded-t-xl" />
        </div>

        {/* Study Wooden Desk Surface */}
        <div className="absolute top-8 inset-x-0 h-6 bg-[#DDB892] dark:bg-[#523B2A] rounded-t-lg border-t-2 border-[#EDE0D4] shadow-md z-20">
          {/* Desk Mat */}
          <div className="absolute top-1 left-8 w-32 h-4 bg-[#7F5539] dark:bg-[#2B1E15] rounded-xs shadow-inner" />
        </div>

        {/* Wooden Desk Legs & Drawers */}
        <div className="absolute top-14 inset-x-0 bottom-0 flex justify-between z-20 pointer-events-none">
          {/* Left Legs */}
          <div className="w-3 h-full bg-[#B08968] dark:bg-[#3D2B1F]" />
          {/* Right Drawer Unit */}
          <div className="w-18 h-full bg-[#B08968] dark:bg-[#3D2B1F] border-l border-[#7F5539] flex flex-col justify-around p-1 shadow-sm">
            <div className="w-full h-3.5 bg-[#9C6644] rounded-xs flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-amber-100 rounded-full" />
            </div>
            <div className="w-full h-3.5 bg-[#9C6644] rounded-xs flex items-center justify-center">
              <div className="w-2.5 h-0.5 bg-amber-100 rounded-full" />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* DESK ITEMS & ACCESSORIES SLOTS                                */}
        {/* ------------------------------------------------------------ */}
        {/* Vintage Desk Lamp (Clickable Toggle Glow!) */}
        <div
          onClick={onToggleLamp}
          className="absolute -top-4 left-2 z-30 cursor-pointer group hover:scale-105 transition-transform"
          title={lampOn ? 'Tắt đèn bàn' : 'Bật đèn bàn'}
        >
          <svg viewBox="0 0 50 60" width="34" height="42" className="overflow-visible">
            {/* Lamp base */}
            <ellipse cx="25" cy="54" rx="12" ry="4" fill="#78350F" />
            {/* Lamp curved neck */}
            <path d="M 25,54 Q 18,30 28,16" fill="none" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
            {/* Lamp Shade */}
            <path d="M 20,16 L 38,16 L 44,28 L 14,28 Z" fill="#B45309" stroke="#92400E" strokeWidth="1" />
            {/* Warm Bulb Glow */}
            {lampOn && (
              <circle cx="29" cy="28" r="6" fill="#FDE047" className="animate-soft-pulse shadow-[0_0_15px_#FDE047]" />
            )}
          </svg>
        </div>

        {/* Placed Desk Item: Laptop / Coffee / Tulip / Succulent */}
        <div
          onClick={() => onSlotClick?.('desk')}
          className="absolute top-1 right-24 z-30 cursor-pointer hover:scale-110 transition-transform"
          title="Vật phẩm trên bàn"
        >
          {deskItem === 'desk_laptop' ? (
            <div className="flex flex-col items-center">
              {/* Laptop screen */}
              <div className="w-10 h-7 bg-stone-800 rounded-t-sm border border-stone-600 flex items-center justify-center">
                <div className="w-7 h-5 bg-sky-100 dark:bg-sky-900 rounded-xs flex items-center justify-center text-[6px]">
                  💻
                </div>
              </div>
              {/* Keyboard base */}
              <div className="w-12 h-1.5 bg-stone-400 rounded-b-xs shadow-xs" />
            </div>
          ) : deskItem === 'desk_coffee_mug' ? (
            <div className="flex flex-col items-center">
              {/* Steam */}
              <span className="text-[10px] text-stone-400 animate-gentle-float -mb-1">♨️</span>
              {/* Mug */}
              <div className="w-5 h-5 bg-amber-100 border border-amber-300 rounded-b-md flex items-center justify-center text-[8px]">
                ☕
              </div>
            </div>
          ) : deskItem === 'plant_succulent' ? (
            <div className="flex flex-col items-center">
              <span className="text-base sm:text-lg animate-gentle-sway">🪴</span>
            </div>
          ) : deskItem === 'plant_tulip' ? (
            <div className="flex flex-col items-center">
              <span className="text-base sm:text-lg animate-gentle-sway">🌷</span>
            </div>
          ) : (
            /* Default: cozy notebook or small mug */
            <div className="text-xs opacity-75">☕</div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 8. VIRTUAL PET (SLEEPING/PLAYING IN COZY NOOK)                  */}
      {/* ============================================================== */}
      {showPet && petItem && (
        <div
          onClick={() => onSlotClick?.('pet')}
          className="absolute top-[68%] left-[28%] z-25 cursor-pointer hover:scale-105 transition-transform"
          title="Thú cưng trong phòng"
        >
          <VirtualPet petId={petItem} size="md" />
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. CHIBI CHARACTER POSITIONING                                 */}
      {/* ============================================================== */}
      {showCharacter && (
        <>
          {characterState === 'focus' ? (
            /* IN FOCUS MODE: Character is sitting at the study desk */
            <div className="absolute top-[40%] right-[22%] z-30 pointer-events-none">
              <ChibiCharacter state="focus" size="md" showSpeechBubble={false} />
            </div>
          ) : (
            /* IN STANDING/IDLE/WELCOME/COMPLETE/GIVEUP: Standing naturally */
            <div className="absolute top-[38%] left-[44%] -translate-x-1/2 z-30 transition-all duration-500">
              <ChibiCharacter
                state={characterState}
                size="md"
                showSpeechBubble={!isFocusModeActive}
              />
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* 10. WARM LIGHTING & NIGHT SHADE OVERLAYS                        */}
      {/* ============================================================== */}
      {/* Desk Lamp Ambient Cone of Warm Light when turned on */}
      {lampOn && (
        <div
          className="absolute top-[48%] right-[16%] w-72 h-72 rounded-full pointer-events-none z-35 mix-blend-screen opacity-70 animate-soft-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, rgba(251, 191, 36, 0.15) 50%, transparent 75%)',
          }}
        />
      )}

      {/* Cozy Vignette & Room Atmosphere */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_0_80px_rgba(0,0,0,0.4)]" />

      {/* Interactive Quick Badges (Clean unboxed hint on hover) */}
      <div className="absolute bottom-2 right-3 z-40 text-[10px] text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-stone-200/60 dark:border-stone-700/60 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
        <span>💡 Bấm đèn để bật/tắt</span>
        <span>·</span>
        <span>🏠 Chạm đồ vật để đổi</span>
      </div>
    </div>
  );
};
