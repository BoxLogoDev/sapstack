---
name: sap-abap
description: >
  This skill handles all SAP ABAP development tasks: writing and debugging reports,
  function modules, classes, BAdIs, enhancement spots, user exits, ALV, SmartForms,
  Adobe Forms, CDS views, RAP (RESTful ABAP Programming Model), OData services,
  ABAP Unit testing, performance analysis, short dump resolution, and Clean Core
  migration planning. Use when user mentions ABAP, SE38, SE24, SE11, SE19, BAdI,
  enhancement, user exit, CDS, RAP, OData, short dump, ST22, SM21, performance,
  ALV, SmartForm, Adobe Form, function module, class, method, clean core,
  S/4HANA extension, ATC, ABAP Unit.
allowed-tools: Read, Grep
---

## 1. Environment Detection

Ask before writing any code:

```
□ ABAP release? (7.02 ECC / 7.40 / 7.50 / 7.57 S/4HANA 2023)
□ Clean Core required? (on-premise CBO allowed vs BTP side-by-side only?)
□ Package / naming convention? (Z* / Y* prefix, package structure)
□ Transport landscape? (DEV → QAS → PRD, how many systems?)
□ S/4HANA deployment? (on-premise / RISE / Cloud PE — affects what's allowed)
```

---

## 2. Enhancement Framework — Decision Table

| Scenario | Recommended Approach | Notes |
|----------|---------------------|-------|
| Classic user exit exists | SMOD / CMOD | ECC only — avoid in new S/4HANA dev |
| BAdI definition exists | New BAdI (SE19 / GET BADI) | All releases — preferred approach |
| No exit/BAdI, on-premise | Enhancement Spot (SE18/SE19) | CBO allowed on-premise |
| S/4HANA Clean Core / Cloud PE | BTP side-by-side extension (RAP + Events) | No on-stack modifications |

---

## 3. Code Patterns with Full Examples

### New BAdI (All Releases — Preferred)

```abap
" Step 1: Find BAdI via SE19 or BADI Explorer (SPRO)
" Step 2: Create enhancement implementation
" Step 3: Implement interface method

DATA lo_badi TYPE REF TO badi_name.
GET BADI lo_badi.
CALL BADI lo_badi->method_name
  EXPORTING iv_input  = lv_value
  IMPORTING ev_output = lv_result.
```

### ALV — OO Approach (Recommended Over REUSE_ALV_GRID_DISPLAY)

```abap
DATA: lo_alv    TYPE REF TO cl_salv_table,
      lt_result TYPE TABLE OF your_structure.

" ... populate lt_result ...

TRY.
    cl_salv_table=>factory(
      IMPORTING r_salv_table = lo_alv
      CHANGING  t_table      = lt_result ).

    " Optional: configure columns
    lo_alv->get_columns( )->set_optimize( abap_true ).

    " Optional: add sort
    DATA(lo_sorts) = lo_alv->get_sorts( ).
    lo_sorts->add_sort( columnname = 'FIELD1' ).

    lo_alv->display( ).
  CATCH cx_salv_msg INTO DATA(lx_err).
    MESSAGE lx_err->get_text( ) TYPE 'E'.
ENDTRY.
```

### BAPI with Complete Error Handling

```abap
DATA lt_return TYPE TABLE OF bapiret2.

CALL FUNCTION 'BAPI_NAME'
  EXPORTING
    iv_param1 = lv_value1
    iv_param2 = lv_value2
  IMPORTING
    ev_result = lv_result
  TABLES
    return    = lt_return.

" ALWAYS check return table — never assume success
IF line_exists( lt_return[ type = 'E' ] )
OR line_exists( lt_return[ type = 'A' ] ).
  " Error — do NOT commit; handle or raise
  LOOP AT lt_return INTO DATA(ls_err) WHERE type CA 'EA'.
    MESSAGE ls_err-message TYPE 'E'.
  ENDLOOP.
ELSE.
  " Success — commit
  CALL FUNCTION 'BAPI_TRANSACTION_COMMIT'
    EXPORTING wait = abap_true.
ENDIF.
```

### CDS View (S/4HANA)

```abap
@AbapCatalog.viewEnhancementCategory: [#NONE]
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'My Entity Description'
@Metadata.ignorePropagatedAnnotations: true

define view entity ZI_MyEntityName
  as select from table_name as t
  association [0..1] to other_table as _Assoc
    on $projection.KeyField = _Assoc.KeyField
{
  key t.key_field       as KeyField,
      t.comp_code       as CompanyCode,
      t.amount          as Amount,
      t.currency        as Currency,
      _Assoc            -- expose association
}
```

### RAP Behavior Definition (S/4HANA)

```abap
managed implementation in class zbp_my_entity unique;
strict ( 2 );

define behavior for ZI_MyEntity alias MyEntity
  persistent table zmy_table
  lock master
  authorization master ( instance )
  etag master LastChangedAt
{
  create;
  update;
  delete;

  field ( readonly )  UUID, CreatedAt, CreatedBy, LastChangedAt, LastChangedBy;
  field ( mandatory ) CompanyCode, DocumentType;

  action post result [1] $self;

  mapping for zmy_table corresponding
  {
    UUID          = entity_uuid;
    CompanyCode   = bukrs;
    DocumentType  = blart;
    CreatedAt     = created_at;
    LastChangedAt = last_changed_at;
  }
}
```

### ABAP Unit Test (Mandatory for Clean Core)

```abap
CLASS ltc_my_class DEFINITION FOR TESTING
  DURATION SHORT
  RISK LEVEL HARMLESS.

  PRIVATE SECTION.
    DATA mo_cut TYPE REF TO zcl_my_class.  " Class Under Test
    METHODS:
      setup,
      test_calculate_positive FOR TESTING,
      test_calculate_zero FOR TESTING.
ENDCLASS.

CLASS ltc_my_class IMPLEMENTATION.
  METHOD setup.
    mo_cut = NEW zcl_my_class( ).
  ENDMETHOD.

  METHOD test_calculate_positive.
    DATA(lv_result) = mo_cut->calculate( iv_base = 100
                                         iv_rate = '0.1' ).
    cl_abap_unit_assert=>assert_equals(
      exp = '10.00'
      act = lv_result
      msg = 'Positive calculation failed' ).
  ENDMETHOD.

  METHOD test_calculate_zero.
    DATA(lv_result) = mo_cut->calculate( iv_base = 0
                                         iv_rate = '0.1' ).
    cl_abap_unit_assert=>assert_equals(
      exp = '0.00'
      act = lv_result
      msg = 'Zero base should return zero' ).
  ENDMETHOD.
ENDCLASS.
```

---

## 4. Performance Troubleshooting

### Short Dump Types (ST22)

| Dump Type | Root Cause | Fix |
|-----------|-----------|-----|
| TIME_LIMIT_EXCEEDED | Infinite loop / unoptimized mass processing | Add `CHECK sy-tabix MOD 100 = 0.` in loop; optimize SQL |
| MEMORY_NO_MORE_PAGING | SELECT * on large table / massive internal table | Select specific fields; use PACKAGE SIZE for batch processing |
| RAISE_EXCEPTION unhandled | TRY-CATCH missing | Wrap in TRY-CATCH block for specific exception class |
| COMPUTE_INT_ZERODIVIDE | Division by zero in calculation | Add zero-check before division |
| OBJECTS_OBJREF_NOT_ASSIGNED | Object reference is initial (null pointer) | Add IS BOUND check before method call |

### SQL Performance (SE30 / SAT Runtime Analysis)

**Bad patterns**:
```abap
" Full table scan — NEVER do this
SELECT * FROM mara INTO TABLE @DATA(lt_mara).

" SELECT inside loop — N+1 query problem
LOOP AT lt_orders INTO DATA(ls_order).
  SELECT SINGLE * FROM mara INTO @DATA(ls_mat)
    WHERE matnr = @ls_order-matnr.   " Called N times!
ENDLOOP.
```

**Good patterns**:
```abap
" Targeted fields + WHERE clause
SELECT matnr, maktx, mtart, meins
  FROM mara
  INTO TABLE @DATA(lt_mara)
  WHERE mtart = 'FERT'
    AND mstae = ' '.

" FOR ALL ENTRIES — single query for all orders
SELECT matnr, maktx
  FROM mara
  INTO TABLE @DATA(lt_mara)
  FOR ALL ENTRIES IN @lt_orders
  WHERE matnr = @lt_orders-matnr.
```

---

## 5. S/4HANA Deprecated Objects → Replacements

| Deprecated | Use Instead | Notes |
|-----------|-------------|-------|
| SELECT from BSEG | `I_JournalEntryItem` (CDS) | ACDOCA is source in S/4HANA |
| SELECT from BSID/BSAD | `I_CustomerLineItem` (CDS) | |
| SELECT from BSIK/BSAK | `I_SupplierLineItem` (CDS) | |
| SELECT from MKPF/MSEG | `I_MaterialDocumentItem` (CDS) | MATDOC is source |
| SELECT * from MARA without WHERE | Targeted CDS view with filter | Performance + compatibility |
| CALL TRANSACTION | BAPI / RAP action / function module | Compatibility issue |
| Logical DB PNPCE | Direct SELECT + AUTHORITY-CHECK | Deprecated in S/4HANA |
| Old BAdI (CL_EXITHANDLER) | New BAdI (GET BADI) | Supported but old style |
| COMMUNICATION statements | RFC / web service | Obsolete |
| Non-Unicode string ops | String templates `\|...\|` | Unicode mandatory |

---

## 6. Universal Code Review Checklist

```
Performance:
□ No SELECT * — only specific fields needed
□ All DB reads have WHERE clause on primary/indexed fields
□ No SELECT inside LOOP — use FOR ALL ENTRIES or JOIN
□ PACKAGE SIZE used for mass data reads

Error Handling:
□ All BAPI calls check RETURN table for E/A type messages
□ All method calls on object references: IS BOUND check
□ TRY-CATCH blocks for risky operations (file I/O, conversions)
□ No COMMIT WORK inside loops

Security:
□ AUTHORITY-CHECK implemented for sensitive data access
□ No hardcoded passwords, API keys, or credentials
□ Input validation before database writes

Clean Core / S/4HANA Compatibility:
□ No direct SELECT on deprecated tables (BSEG, MKPF/MSEG)
□ No CALL TRANSACTION in background-capable programs
□ No modifications to SAP standard objects (use enhancements)

Technical:
□ No hardcoded org values (company code, plant, G/L accounts)
□ Unicode-compatible: SE38 → Program Attributes → Unicode checked
□ Program type correct (Type 1 for reports, M for module pool)
□ Transport request assigned and documented

Quality:
□ ABAP Unit test class included
□ ATC (ABAP Test Cockpit) check clean — no Priority 1 or 2 findings
□ Code formatted with Pretty Printer (Shift+F1)
□ Comments in English for shared / international teams
```

Full checklist: `references/code-review-checklist.md`

---

## 7. References

- `references/clean-core-patterns.md` — extensibility tier guide, RAP vs CBO decision, key CDS annotations
- `references/code-review-checklist.md` — full ABAP code review checklist with explanations
