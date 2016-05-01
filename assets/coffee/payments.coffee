class Payments
  constructor: (options = {}) ->
    me = @
    @options = options
    me._eventsBinding()
  _eventsBinding: ->
    $(".payment_form .form-control").bind "keyup", (e) ->
      $(@).removeClass("error") if $(@).hasClass "error"
    $("#cc_expire").inputmask "99/9999"
    $("#cc_ccv").inputmask
      mask: '9'
      repeat: 3
      greedy: false
    $("#cc_number").inputmask
      mask: '9'
      repeat: 16
      greedy: false
    $("#cc_amount").inputmask "9{*}"
    $("#cc_fullname").inputmask "a{*} a{*}"
    $("#cc_holder_name").inputmask "a{*} a{*}"
  @_activateLoader: ->
    $("#sbm_button").addClass 'disabled'
    $("#sbm_button").prop 'disabled', true
    $(".payment_process_loader").addClass "active"
  @_deactivateLoader: ->
    $("#sbm_button").removeClass 'disabled'
    $("#sbm_button").prop 'disabled', false
    $(".payment_process_loader").removeClass "active"
  @_validateCreditCardData: (cc_data) ->
    v_errors = []
    card_type = ''
    is_valid_cardnumber = $.payform.validateCardNumber cc_data.number
    if cc_data.amount is ''
      mid_error =
        id: "cc_amount"
        type: "card_amount"
        msg: "Amount can't be empty"
      v_errors.push mid_error
    if is_valid_cardnumber
      card_type = $.payform.parseCardType cc_data.number
    else
      mid_error =
        id: "cc_number"
        type: "card_number"
        msg: "Invalid credit card number"
      v_errors.push mid_error
    is_cvv_valid = $.payform.validateCardCVC cc_data.ccv, card_type
    unless is_cvv_valid
      mid_error =
        id: "cc_ccv"
        type: "cvv"
        msg: "Invalid CCV"
      v_errors.push mid_error
    is_valid_expire = false
    parse_cc_expire = $.payform.parseCardExpiry cc_data.expire
    unless _.isEmpty(parse_cc_expire)
      is_valid_expire = $.payform.validateCardExpiry parse_cc_expire.month, parse_cc_expire.year
    unless is_valid_expire
      mid_error =
        id: "cc_expire"
        type: "expire"
        msg: "Invalid expiration date"
      v_errors.push mid_error
    v_results =
      card_type: card_type
      v_errors: v_errors
  @_responsePaymentHandler: (response_data) ->
    @_deactivateLoader()
    if response_data.status
      toastr.success "#{response_data.msg}"
      unless response_data.mongo_status
        toastr.error "#{response_data.mongo_msg}"
      else
        toastr.success "#{response_data.mongo_msg}"
    else
      toastr.error "#{response_data.msg}"
  @_requestPaypalPayment: (send_data) ->
    @_activateLoader()
    me = @
    request_call = $.post "/payment_gateway_paypal", send_data, 'json'
    request_call.done (response_data) ->
      me._responsePaymentHandler response_data
  @_requestBraintreePayment: (cc_data) ->
    me = @
    card =
      number: cc_data.number
      expirationDate: cc_data.expire
      cvv: cc_data.ccv
    @_activateLoader()
    request_call = $.get "/braintree_client_token", 'json'
    request_call.done (client_token) ->
      client = new braintree.api.Client
        clientToken: client_token
      client.tokenizeCard card, (error, nonce) ->
        unless error
          send_data =
            amount: cc_data.amount
            nonce: nonce
          request_call = $.post "/payment_gateway_braintree", send_data, 'json'
          request_call.done (response_data) ->
            me._responsePaymentHandler response_data
        else
          toastr.error "#{error}"
  @_submitPaymentForm: ->
    me = @
    cc_data =
      amount: $.trim $("#cc_amount").val()
      curr: $("#cc_curr > option:selected").val()
      fullname: $.trim $("#cc_fullname").val()
      holder_name: $.trim $("#cc_holder_name").val()
      number: $.trim $("#cc_number").val()
      expire: $.trim $("#cc_expire").val()
      ccv: $.trim $("#cc_ccv").val()
    validate_res = @_validateCreditCardData cc_data
    if validate_res.v_errors.length > 0
      error_messages = ""
      for v_error in validate_res.v_errors
        $("##{v_error.id}").addClass 'error'
        error_messages += "<p>#{v_error.msg}</p>"
      toastr.error error_messages
    else
      $(".cc_card_type").html "<span class='label label-success'>#{validate_res.card_type}</span>"
      $(".cc_card_type").addClass 'active'

      if validate_res.card_type
        if validate_res.card_type is 'amex' and cc_data.curr isnt 'USD'
          toastr.error "AMEX is possible to use only for USD"
        else
          if cc_data.curr is 'USD' or cc_data.curr is 'EUR' or cc_data.curr is 'AUD'
            send_data =
              card_type: validate_res.card_type
              cc_data: cc_data
            @_requestPaypalPayment send_data
          else
            @_requestBraintreePayment cc_data
      else
        toastr.error "Card type is not detected"
    false

payments = new Payments
