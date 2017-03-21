// A $( document ).ready() block.
$( document ).ready(function() {
    $( "#send_classifications" ).click(function() {
      classifications = []
	  $( "select" ).each(function( index ) {
	  	classification = [this.id.split("-")[1], $( this ).val()]
	  	classifications.push(classification);
	  });
	  console.log(classifications);

	  $.ajax({
		  type: "POST",
		  url: "/classifier/",
		  dataType: 'jsonp',
		  data: {
		  	classifications: classifications
		  },
		  success: function(msg){
		        alert( "Suas classificações foram salvas!" );
		        window.location.href = "/login";
		  },
		  error: function(XMLHttpRequest, textStatus, errorThrown) {
		  	 if (XMLHttpRequest.status == 401) {
		  	 	alert("Você já enviou uma classificação essa semana. "
		  	 		+ "Aguarde o racha da próxima semana para atualizar suas classificações");
		  	 	window.location.href = "/login";
		  	 	return;
		  	 }
		  	 else if (XMLHttpRequest.status == 200) {
		  	 	 alert( "Suas classificações foram salvas!" );
		         window.location.href = "/login";
		  	 }

		  	 else {
			     alert("Houve algum erro com a sua classificação. Entre em contato com a Diretoria e tente novamente em alguns instantes");
		  	 }

		  }
		});
	});

	$( "#button_draw" ).click(function() {
		$.ajax({
		  type: "POST",
		  url: "/draw_teams/",
		  success: function(msg){
	         window.location.href = "/";
		  },
		  error: function(XMLHttpRequest, textStatus, errorThrown) {
		     alert("Erro no sorteio!");
		  }
		});
	});

	$( "#button_classify" ).click(function() {
		 window.location.href = "/classifier";
	});

	$( "#login_button" ).click(function() {
		 window.location.href = "/login";
	});

	$( "#logout_button" ).click(function() {
		 window.location.href = "/login";
	});
});