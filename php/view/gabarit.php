<!DOCTYPE html>
<head>
	<meta http-equiv="Content-type" content="text/html; charset=utf-8">
	<title>Table Narration</title>
	<!-- Javascript -->
	<?php include "./php/lib/librairies-js.php" ?>
	<!-- Css -->
	<?php include "./php/lib/librairies-css.php" ?>
</head>
<body>
  <div id="flash" style="display:none;"></div>
  <?php include "./php/view/section_header.php" ?>
	<section id="table">
	</section>
  <?php include "./php/view/section_footer.php" ?>
  <!-- Lecteur du livre -->
  <div id="div_book_pdf">
    <object
      id="book-pdf"
      data="" 
      type="application/pdf"
      ></object>
  </div>
</body>
</html>