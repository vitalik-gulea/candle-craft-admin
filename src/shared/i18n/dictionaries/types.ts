export interface TranslationDictionary {
  auth: {
    login: {
      title: string
      subtitle: string
      emailLabel: string
      emailPlaceholder: string
      passwordLabel: string
      passwordPlaceholder: string
      showPassword: string
      hidePassword: string
      rememberMe: string
      submit: string
      errors: {
        emailRequired: string
        emailInvalid: string
        passwordRequired: string
        invalidCredentials: string
        unknown: string
      }
    }
  }
  sidebar: {
    brand: string
    tagline: string
    language: string
    logout: string
    roles: {
      admin: string
      manager: string
    }
  }
  nav: {
    dashboard: string
    products: string
    categories: string
    unitsOfSale: string
    notifications: string
    orders: string
    homepage: string
    uiTexts: string
    trash: string
    settings: string
  }
  uiTexts: {
    subtitle: string
    searchPlaceholder: string
    changedCount: string
    customized: string
    actions: { reset: string; resetRow: string; restoreDefault: string }
    sections: {
      meta: string
      nav: string
      aria: string
      drawer: string
      hero: string
      categoryGrid: string
      bestSellers: string
      searchModal: string
      shop: string
      productPage: string
      cart: string
      checkout: string
      deliveryMethods: string
      footer: string
    }
    toasts: { saved: string; restored: string }
    errors: { load: string; invalid: string; notFound: string; forbidden: string; unknown: string }
  }
  unitsOfSale: {
    breadcrumbCatalog: string
    add: string
    addFirst: string
    disabledSuffix: string
    dragHandle: string
    createInline: string
    columns: { ro: string; ru: string; status: string; actions: string }
    status: { active: string; disabled: string }
    actions: { edit: string; disable: string; enable: string }
    empty: { title: string; hint: string }
    modal: {
      createTitle: string
      editTitle: string
      nameRo: string
      nameRu: string
      sortOrder: string
      isActive: string
      isActiveHint: string
    }
    errors: {
      required: string
      maxLength: string
      integer: string
      validation: string
      notFound: string
      forbidden: string
      unknown: string
    }
  }
  notifications: {
    breadcrumbManagement: string
    add: string
    addFirst: string
    neverExpires: string
    columns: { message: string; status: string; expires: string; actions: string }
    status: { visible: string; hidden: string; expired: string }
    actions: { edit: string; delete: string; show: string; hide: string }
    empty: { title: string; hint: string }
    modal: {
      createTitle: string
      editTitle: string
      messageRo: string
      messageRu: string
      isActive: string
      isActiveHint: string
      noExpiry: string
      durationHours: string
      durationHint: string
      durationEditHint: string
    }
    delete: { title: string; confirm: string }
    errors: {
      required: string
      positiveInteger: string
      validation: string
      notFound: string
      forbidden: string
      unknown: string
    }
  }
  homepage: {
    subtitle: string
    emptySlot: string
    notPublished: string
    moveUp: string
    moveDown: string
    remove: string
    actions: { reset: string }
    categories: {
      title: string
      hint: string
      add: string
      pickerTitle: string
      search: string
    }
    products: {
      title: string
      hint: string
      add: string
      pickerTitle: string
      search: string
    }
    picker: { selected: string; add: string }
    toasts: { saved: string }
    errors: { load: string; unknown: string }
  }
  dashboard: {
    title: string
    greeting: string
  }
  common: {
    comingSoon: string
    search: string
    create: string
    save: string
    cancel: string
    actions: string
    loading: string
    empty: string
    retry: string
    all: string
    yes: string
    no: string
  }
  trash: {
    subtitle: string
    empty: string
    purgeInDays: string
    filters: {
      label: string
      all: string
      product: string
      category: string
    }
    types: {
      product: string
      category: string
    }
    columns: {
      type: string
      name: string
      deletedAt: string
      purgeIn: string
      actions: string
    }
    actions: {
      restore: string
      permanentDelete: string
    }
    permanentDelete: {
      title: string
      confirm: string
      redirectLabel: string
      redirectNone: string
      redirectHint: string
    }
    toasts: {
      restored: string
      deleted: string
    }
    errors: {
      notFound: string
      forbidden: string
      unknown: string
    }
  }
  products: {
    title: string
    subtitle: string
    searchPlaceholder: string
    addProduct: string
    itemsCount: string
    stockUnit: string
    createDraft: string
    createTitle: string
    nameRo: string
    nameRu: string
    nameRoPlaceholder: string
    nameRuPlaceholder: string
    bulk: {
      selected: string
      hide: string
      delete: string
      hint: string
    }
    pagination: {
      prev: string
      next: string
    }
    filters: {
      categoryLabel: string
      statusLabel: string
    }
    columns: {
      image: string
      name: string
      category: string
      price: string
      stock: string
      status: string
      actions: string
    }
    stockStatus: {
      active: string
      low: string
      outOfStock: string
    }
    actions: {
      edit: string
      hide: string
      show: string
      copy: string
      trash: string
      restore: string
      permanentlyDelete: string
    }
    errors: {
      nameRoRequired: string
      nameRuRequired: string
      conflict: string
      validation: string
      notFound: string
      unknown: string
    }
    new: {
      breadcrumbProducts: string
      breadcrumbNew: string
      breadcrumbEdit: string
      title: string
      subtitle: string
      editTitle: string
      editSubtitle: string
      saveDraft: string
      save: string
      publish: string
      fillMock: string
      requiredBadge: string
      draftSaved: string
      published: string
      sections: {
        type: {
          title: string
          simple: string
          simpleHint: string
          variations: string
          variationsHint: string
          note: string
        }
        basicInfo: {
          title: string
          name: string
          namePlaceholderRo: string
          namePlaceholderRu: string
          shortDescription: string
          shortDescriptionPlaceholderRo: string
          shortDescriptionPlaceholderRu: string
          fullDescription: string
          fullDescriptionPlaceholderRo: string
          fullDescriptionPlaceholderRu: string
        }
        media: {
          title: string
          dropzoneTitle: string
          dropzoneHint: string
          addSlot: string
          remove: string
          uploading: string
          mainImageAlt: string
          galleryAlt: string
          altPlaceholderRo: string
          altPlaceholderRu: string
        }
        inventory: {
          title: string
          price: string
          discountPrice: string
          discountPricePlaceholder: string
          stock: string
          sku: string
          skuPlaceholder: string
          hint: string
        }
        categoryStatus: {
          title: string
          mainCategory: string
          mainCategoryPlaceholder: string
          additionalCategories: string
          additionalCategoriesPlaceholder: string
          status: string
          statusOptions: {
            draft: string
            published: string
            hidden: string
          }
          newBadge: string
        }
        characteristics: {
          title: string
          unitOfSale: string
          unitOfSalePlaceholder: string
        }
        seo: {
          title: string
          seoTitle: string
          seoTitlePlaceholderRo: string
          seoTitlePlaceholderRu: string
          metaDescription: string
          metaDescriptionPlaceholderRo: string
          metaDescriptionPlaceholderRu: string
          slug: string
          slugHint: string
        }
        badges: {
          title: string
          discountStart: string
          discountEnd: string
        }
        readiness: {
          title: string
          nameAndSlug: string
          shortDescription: string
          mainCategory: string
          unitOfSale: string
          mainImage: string
          seo: string
          priceAndStock: string
          blockedTitle: string
          blockedHint: string
        }
      }
      errors: {
        nameRoRequired: string
        nameRuRequired: string
        shortDescriptionRoRequired: string
        shortDescriptionRuRequired: string
        fullDescriptionRoRequired: string
        fullDescriptionRuRequired: string
        priceRequired: string
        priceInvalid: string
        discountPriceInvalid: string
        discountPriceTooHigh: string
        stockRequired: string
        stockInvalid: string
        categoryRequired: string
        slugRoRequired: string
        slugRuRequired: string
        slugInvalid: string
        seoTitleRoRequired: string
        seoTitleRuRequired: string
        metaDescriptionRoRequired: string
        metaDescriptionRuRequired: string
        discountPeriodInvalid: string
        imageUploadFailed: string
        galleryFailed: string
        createFailed: string
        updateFailed: string
        loadFailed: string
      }
    }
  }
  categories: {
    breadcrumbManagement: string
    addCategory: string
    searchPlaceholder: string
    itemsCount: string
    productsCount: string
    createTitle: string
    editTitle: string
    create: string
    nameRo: string
    nameRu: string
    nameRoPlaceholder: string
    nameRuPlaceholder: string
    publishNow: string
    new: {
      saveDraft: string
      publish: string
      basic: { title: string; hint: string }
      name: string
      namePlaceholderRo: string
      namePlaceholderRu: string
      url: string
      urlPlaceholder: string
      urlHint: string
      parent: string
      parentNone: string
      parentHint: string
      image: string
      dropzoneTitle: string
      dropzoneHint: string
      uploading: string
      removeImage: string
      alt: string
      altPlaceholder: string
      altHint: string
      description: string
      descriptionPlaceholder: string
      seo: {
        title: string
        hint: string
        seoTitle: string
        seoTitlePlaceholder: string
        metaDescription: string
        metaDescriptionPlaceholder: string
      }
      faq: {
        title: string
        hint: string
        optional: string
        question: string
        questionPlaceholder: string
        answer: string
        answerPlaceholder: string
        add: string
        remove: string
      }
      visibility: {
        title: string
        status: string
        catalog: string
        catalogHint: string
        navigation: string
        navigationHint: string
        homepage: string
        homepageHint: string
        homepageOrder: string
        subcategories: string
        subcategoriesHint: string
      }
      readiness: { title: string; name: string; url: string; image: string }
    }
    status: {
      draft: string
      published: string
    }
    actions: {
      edit: string
      hide: string
      show: string
      trash: string
      restore: string
      permanentlyDelete: string
    }
    errors: {
      nameRoRequired: string
      nameRuRequired: string
      conflict: string
      validation: string
      notFound: string
      unknown: string
      imageUploadFailed: string
      slugInvalid: string
      faqIncomplete: string
      faqFailed: string
    }
  }
}
