<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241027051108 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // We have to drop the foreign key constraints to make this work then re-add them -.-
        $this->addSql('ALTER TABLE project_goal DROP FOREIGN KEY FK_C54D2336166D1F9C');
        $this->addSql('ALTER TABLE login_token DROP FOREIGN KEY FK_594766AFA76ED395');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EEA76ED395');

        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE
          login_token
        CHANGE
          id id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\',
        CHANGE
          user_id user_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE
          project
        CHANGE
          id id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\',
        CHANGE
          user_id user_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE
          project_goal
        CHANGE
          id id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\',
        CHANGE
          project_id project_id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\'');
        $this->addSql('ALTER TABLE user CHANGE id id BINARY(16) NOT NULL COMMENT \'(DC2Type:uuid)\'');

        // Now add back in the foreign key constraints
        $this->addSql('ALTER TABLE project_goal ADD CONSTRAINT FK_C54D2336166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE login_token ADD CONSTRAINT FK_594766AFA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');

    }

    public function down(Schema $schema): void
    {
        // We have to drop the foreign key constraints to make this work then re-add them -.-
        $this->addSql('ALTER TABLE project_goal DROP FOREIGN KEY FK_C54D2336166D1F9C');
        $this->addSql('ALTER TABLE login_token DROP FOREIGN KEY FK_594766AFA76ED395');
        $this->addSql('ALTER TABLE project DROP FOREIGN KEY FK_2FB3D0EEA76ED395');

        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE
          project_goal
        CHANGE
          id id INT AUTO_INCREMENT NOT NULL,
        CHANGE
          project_id project_id INT NOT NULL');
        $this->addSql('ALTER TABLE
          project
        CHANGE
          id id INT AUTO_INCREMENT NOT NULL,
        CHANGE
          user_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE
          login_token
        CHANGE
          id id INT AUTO_INCREMENT NOT NULL,
        CHANGE
          user_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE user CHANGE id id INT AUTO_INCREMENT NOT NULL');

        // Now add back in the foreign key constraints
        $this->addSql('ALTER TABLE project_goal ADD CONSTRAINT FK_C54D2336166D1F9C FOREIGN KEY (project_id) REFERENCES project (id)');
        $this->addSql('ALTER TABLE project ADD CONSTRAINT FK_2FB3D0EEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE login_token ADD CONSTRAINT FK_594766AFA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
    }
}
