-- SUPPRIVA INGREDIENT CONTENT PILOT: 5-HTP
-- Safe to run multiple times.
-- Populates only the dashboard-driven content fields for the published 5-HTP
-- ingredient profile. This does not alter schema or touch any other ingredient.

update public.ingredients
set
  name = '5-HTP',
  scientific_name = '5-Hydroxytryptophan',
  hero_badge = 'Sleep & Mood Support',
  short_description = '5-HTP is a dietary supplement ingredient commonly researched for its role as a serotonin precursor. Suppriva reviews it through an educational lens, including how it may fit into sleep, mood, and relaxation-focused wellness routines.',
  overview_title = 'What Is 5-HTP?',
  overview_subtitle = 'A practical look at how this serotonin-supporting ingredient is commonly discussed in wellness and supplement education.',
  overview_content = $content$5-HTP, short for 5-hydroxytryptophan, is a compound the body naturally makes from the amino acid tryptophan. It sits in an important metabolic pathway: tryptophan can be converted into 5-HTP, and 5-HTP can then be converted into serotonin. Because serotonin is involved in mood, appetite signaling, relaxation, and sleep-wake biology, 5-HTP has become a common ingredient in supplements positioned around sleep preparation, emotional wellness, and calmer evening routines.

In supplement form, 5-HTP is often sourced from the seeds of Griffonia simplicifolia, a West African plant. The ingredient is usually sold as capsules or tablets, sometimes as a standalone product and sometimes alongside calming ingredients such as magnesium, L-theanine, melatonin, valerian, or passionflower. Suppriva evaluates 5-HTP as an ingredient rather than as a promise. The goal is to help readers understand what the ingredient is, why it appears in formulas, and what safety questions should be considered before use.

The main reason people research 5-HTP is its relationship to serotonin production. Serotonin does not work in isolation, and wellness outcomes are influenced by sleep habits, stress load, diet, medications, health conditions, and individual biology. For that reason, responsible supplement education should avoid presenting 5-HTP as a guaranteed solution. It is better understood as a targeted ingredient that may be relevant to certain routines, especially when someone is comparing labels built around relaxation, mood support, or sleep quality.

5-HTP also deserves careful safety review. Because it may influence serotonin pathways, it should be approached cautiously by people who take antidepressants, migraine medications, mood-related prescriptions, or other serotonergic supplements. Combining serotonin-active substances can raise the risk of unwanted effects and should be discussed with a qualified healthcare professional. Commonly discussed side effects include nausea, digestive discomfort, drowsiness, vivid dreams, headache, or changes in sleep patterns.

For shoppers comparing supplement formulas, useful questions include: Is the 5-HTP dose clearly listed? Is it a standalone formula or part of a blend? Are there additional sedating or serotonin-related ingredients? Does the label explain timing and caution statements? Is the brand transparent about serving size and intended use? Answering those questions can make 5-HTP easier to evaluate within a broader wellness routine.

This profile is educational only and should not be used as personal medical advice. Anyone who is pregnant, nursing, managing a medical condition, taking prescription medication, or unsure whether 5-HTP fits their routine should speak with a healthcare professional before using it.$content$,
  interesting_fact_label = 'Ingredient Insight',
  interesting_fact = $content$5-HTP is one step closer to serotonin than tryptophan in the body’s natural conversion pathway. That is why it is often discussed differently from general amino acid supplements and why medication interactions deserve special attention.$content$,
  how_it_works_title = 'How 5-HTP Works',
  how_it_works_subtitle = 'Understanding the serotonin pathway helps explain why 5-HTP appears in sleep and mood-support formulas.',
  how_it_works_highlight_title = 'Serotonin Precursor Pathway',
  how_it_works_highlight_description = $content$5-HTP is commonly described as a direct precursor to serotonin. The body can convert 5-HTP into serotonin, a neurotransmitter involved in mood regulation, relaxation, appetite signaling, and sleep-related biology.$content$,
  how_it_works_content = $content$5-HTP is part of a natural pathway that begins with tryptophan, an essential amino acid found in protein-containing foods. The body can convert tryptophan into 5-HTP, and then convert 5-HTP into serotonin. Because serotonin is involved in several nervous system functions, 5-HTP is often included in supplements designed around sleep preparation, relaxation, and emotional wellness support.

This pathway is the main educational reason 5-HTP receives attention. Serotonin plays a role in mood signaling and also connects indirectly with melatonin biology, since melatonin is produced from serotonin through additional steps. That relationship helps explain why some people compare 5-HTP with nighttime ingredients, though it should not be treated as interchangeable with melatonin or as a guaranteed sleep aid.

The practical effect of 5-HTP can vary. Individual response may depend on baseline nutrition, stress, sleep habits, medication use, digestive tolerance, dose, timing, and the presence of other ingredients in a formula. Some people may find serotonin-supporting ingredients too calming or may experience digestive discomfort. Others may not notice a clear effect.

Safety is especially important because serotonin pathways are also affected by many medications. Antidepressants, certain migraine medications, and other serotonin-active products may not be appropriate to combine with 5-HTP unless a qualified clinician has reviewed the situation. For supplement comparison, 5-HTP should be evaluated with both potential benefits and interaction risks in mind.$content$,
  benefits_title = 'Potential Benefits of 5-HTP',
  benefits_subtitle = 'Educational benefits commonly discussed in relation to serotonin support, sleep preparation, and relaxation routines.',
  benefits_json = '[
    {
      "icon": "moon",
      "title": "Sleep Preparation Support",
      "description": "5-HTP is often researched in evening routines because serotonin is connected to sleep-related biology and downstream melatonin production."
    },
    {
      "icon": "brain",
      "title": "Mood Pathway Support",
      "description": "As a serotonin precursor, 5-HTP is commonly discussed in the context of emotional wellness and balanced mood signaling."
    },
    {
      "icon": "sparkles",
      "title": "Relaxation Routine Fit",
      "description": "Many formulas position 5-HTP alongside calming ingredients for people comparing relaxation-focused supplement stacks."
    },
    {
      "icon": "utensils",
      "title": "Appetite Signaling Context",
      "description": "Serotonin is involved in appetite-related signaling, which is why 5-HTP sometimes appears in wellness formulas tied to cravings or routine consistency."
    },
    {
      "icon": "clipboard-check",
      "title": "Clear Label Comparison",
      "description": "Because 5-HTP is usually listed with a defined milligram amount, it can be easier to compare across formulas than vague proprietary blends."
    },
    {
      "icon": "shield-check",
      "title": "Targeted Ingredient Education",
      "description": "Understanding 5-HTP helps shoppers ask better questions about timing, serving size, sedating ingredients, and serotonin-related safety cautions."
    }
  ]'::jsonb,
  dosage_title = 'Typical Dosage',
  dosage_subtitle = 'Common serving ranges are discussed for education only; individual needs and safety factors vary.',
  typical_dose = 'Common supplement labels often range from 50 mg to 200 mg per serving, depending on the formula and intended use.',
  dosage = 'Common supplement labels often range from 50 mg to 200 mg per serving, depending on the formula and intended use.',
  dosage_content = $content$5-HTP dosage varies widely by product, intended use, timing, and individual tolerance. Many supplement labels commonly list servings in the 50 mg to 200 mg range, although some products may use lower or higher amounts. These ranges are educational observations from typical supplement guidance and should not be interpreted as a personal recommendation.

People comparing 5-HTP products should review the full Supplement Facts panel rather than focusing only on the front label. Important details include the amount of 5-HTP per serving, whether the product is standalone or part of a blend, suggested timing, serving frequency, and any caution language related to medications or drowsiness.

Starting any serotonin-active supplement should be approached carefully. Individual response can differ, and more is not always better. People taking medications, managing mood disorders, preparing for surgery, pregnant or nursing individuals, and anyone with a medical condition should speak with a healthcare professional before using 5-HTP. If a product causes uncomfortable effects such as nausea, unusual drowsiness, agitation, or sleep disruption, the label directions and professional guidance should be reviewed.$content$,
  safety_title = 'Safety Information',
  safety_subtitle = 'Key cautions to review before considering 5-HTP as part of a wellness routine.',
  side_effects = array[
    'Digestive discomfort',
    'Drowsiness',
    'Headache',
    'Vivid dreams',
    'Restlessness or unusual mood changes'
  ],
  side_effects_json = '[
    {
      "icon": "stomach",
      "title": "Digestive Discomfort",
      "description": "Nausea, stomach upset, heartburn, or loose stools are among the commonly discussed side effects."
    },
    {
      "icon": "moon",
      "title": "Drowsiness",
      "description": "5-HTP may feel calming or sedating for some people, especially when combined with sleep-focused ingredients."
    },
    {
      "icon": "activity",
      "title": "Headache or Restlessness",
      "description": "Some users report headache, vivid dreams, or feeling unsettled, depending on dose and individual sensitivity."
    },
    {
      "icon": "alert-circle",
      "title": "Serotonin-Related Caution",
      "description": "Unusual agitation, confusion, sweating, rapid heartbeat, or severe symptoms require prompt medical attention."
    }
  ]'::jsonb,
  drug_interactions_json = '[
    "Antidepressants such as SSRIs, SNRIs, MAOIs, tricyclic antidepressants, or other medications that affect serotonin should not be combined with 5-HTP unless a clinician approves.",
    "Migraine medications in the triptan class may also affect serotonin pathways and should be reviewed with a healthcare professional.",
    "Sedatives, sleep aids, alcohol, or formulas containing multiple calming ingredients may increase drowsiness or next-day grogginess.",
    "Herbal or supplemental products that may influence serotonin or sedation, such as St. John’s wort, SAM-e, melatonin, valerian, or tryptophan, should be reviewed before stacking."
  ]'::jsonb,
  who_should_avoid_json = '[
    "People taking antidepressants, migraine medications, or other serotonin-active prescriptions unless supervised by a qualified healthcare professional.",
    "Pregnant or nursing individuals unless specifically advised by a clinician.",
    "People with bipolar disorder, significant mood disorders, or a history of serotonin syndrome unless medically supervised.",
    "Anyone scheduled for surgery or using sedating medications should ask a healthcare professional before use.",
    "Children and adolescents should not use 5-HTP unless directed by a qualified pediatric healthcare professional."
  ]'::jsonb,
  faq_title = 'Frequently Asked Questions',
  faq_subtitle = 'Educational answers to common questions about 5-HTP, serotonin support, and supplement safety.',
  faq_json = '[
    {
      "question": "What is 5-HTP?",
      "answer": "5-HTP stands for 5-hydroxytryptophan. It is a compound the body can make from tryptophan and then convert into serotonin."
    },
    {
      "question": "Why is 5-HTP used in supplements?",
      "answer": "5-HTP is commonly included in supplements because of its role as a serotonin precursor. It often appears in formulas positioned around sleep preparation, relaxation, mood support, or appetite-related wellness routines."
    },
    {
      "question": "Is 5-HTP the same as serotonin?",
      "answer": "No. 5-HTP is not serotonin. It is a precursor that the body can convert into serotonin through normal biochemical pathways."
    },
    {
      "question": "Can 5-HTP help with sleep?",
      "answer": "5-HTP is often discussed in relation to sleep because serotonin is connected to sleep-related biology and can be converted downstream into melatonin. Individual results vary, and it should not be viewed as a guaranteed sleep solution."
    },
    {
      "question": "Can 5-HTP be taken with antidepressants?",
      "answer": "People taking antidepressants or other serotonin-active medications should not combine them with 5-HTP unless a qualified healthcare professional specifically advises it."
    },
    {
      "question": "What are common side effects of 5-HTP?",
      "answer": "Commonly discussed side effects include nausea, digestive discomfort, drowsiness, headache, vivid dreams, or restlessness. More serious symptoms require medical attention."
    },
    {
      "question": "What dose of 5-HTP is commonly listed on supplement labels?",
      "answer": "Many products list servings in the 50 mg to 200 mg range, but dose varies by formula. Follow the product label and consult a healthcare professional for personal guidance."
    },
    {
      "question": "Should 5-HTP be taken during the day or at night?",
      "answer": "Timing depends on the product and the user’s tolerance. Because it may feel calming or sedating, many labels position it for evening use, but label directions should be followed."
    },
    {
      "question": "Who should be cautious with 5-HTP?",
      "answer": "People who are pregnant, nursing, taking medications, managing mood disorders, preparing for surgery, or sensitive to sedating ingredients should seek professional guidance before use."
    },
    {
      "question": "How should I compare 5-HTP supplements?",
      "answer": "Compare the listed dose, formula type, added ingredients, caution statements, timing directions, and whether the brand clearly explains its serving size and intended use."
    }
  ]'::jsonb,
  sidebar_profile_title = '5-HTP Snapshot',
  sidebar_profile_content = $content$5-HTP is a serotonin precursor commonly researched for sleep preparation, relaxation, and mood-related wellness education. It is best evaluated with careful attention to dose transparency, timing, and serotonin-related medication cautions.$content$,
  sidebar_quick_facts_json = '[
    {
      "label": "Type",
      "value": "Serotonin precursor"
    },
    {
      "label": "Typical Dose",
      "value": "Often 50–200 mg per serving on supplement labels"
    },
    {
      "label": "Best For",
      "value": "Sleep preparation and mood-support research"
    },
    {
      "label": "Safety Level",
      "value": "Use caution with serotonin-active medications"
    },
    {
      "label": "Origin",
      "value": "Commonly sourced from Griffonia simplicifolia seed extract"
    },
    {
      "label": "Form",
      "value": "Capsule or tablet"
    },
    {
      "label": "Taste",
      "value": "Usually neutral in capsules"
    }
  ]'::jsonb,
  sidebar_at_a_glance_content = $content$- Serotonin precursor commonly used in sleep and mood-support formulas
- Often sourced from Griffonia simplicifolia seed extract
- Frequently compared with melatonin, magnesium, L-theanine, and tryptophan
- Should be reviewed carefully with antidepressants, migraine medications, sedatives, or other serotonin-active products
- Educational profile only; not personal medical advice$content$,
  full_description = $content$5-HTP is a dietary supplement ingredient commonly discussed for its role in serotonin production, sleep preparation, and mood-related wellness education. It should be evaluated carefully because serotonin-active ingredients may interact with medications and may not be appropriate for everyone.$content$,
  best_for = 'Sleep preparation and mood-support research',
  safety_level = 'Use caution with serotonin-active medications',
  origin_country = coalesce(nullif(origin_country, ''), 'West Africa'),
  part_used = coalesce(nullif(part_used, ''), 'Griffonia simplicifolia seed extract'),
  ingredient_form = coalesce(nullif(ingredient_form, ''), 'Capsule or tablet'),
  taste_profile = coalesce(nullif(taste_profile, ''), 'Neutral in capsule form'),
  updated_at = now()
where slug = '5-htp'
  and deleted_at is null;

notify pgrst, 'reload schema';
